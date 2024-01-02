const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const GRID_SIZE = 64;

if (!navigator.gpu) {
  throw new Error("WebGPU not supported on this browser.");
}

const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
  throw new Error("No appropriate GPUAdapter found.");
}

const device = await adapter.requestDevice();

const context = canvas.getContext("webgpu");

// Rectangle
const vertices = new Float32Array([
  // X,   Y,
  -0.8,
  -0.8, // Triangle 1 (bottom right)
  0.8,
  -0.8,
  0.8,
  0.8,
  -0.8,
  -0.8, // Triangle 2 (top left)
  0.8,
  0.8,
  -0.8,
  0.8,
]);
const vertexBuffer = device.createBuffer({
  label: "Cell Vertices",
  size: vertices.byteLength,
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});
device.queue.writeBuffer(vertexBuffer, /*offset=*/ 0, vertices);

const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
context?.configure({ device, format: canvasFormat });

// Create a uniform buffer that describes the grid.
const uniformArray = new Float32Array([GRID_SIZE, GRID_SIZE]);
const uniformBuffer = device.createBuffer({
  label: "Grid Uniforms",
  size: uniformArray.byteLength,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});
device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

// Create an array representing the active state of each cell.
const cellStateArray = new Uint32Array(GRID_SIZE * GRID_SIZE);
const cellStateStorage = [
  // Active / Passive Game State
  device.createBuffer({
    label: "Cell State A",
    size: cellStateArray.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  }),
  device.createBuffer({
    label: "Cell State B",
    size: cellStateArray.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  }),
];

// Fill first
// Set each cell to a random state, then copy the JavaScript array
// into the storage buffer.
for (let i = 0; i < cellStateArray.length; ++i) {
  cellStateArray[i] = Math.random() > 0.6 ? 1 : 0;
}
device.queue.writeBuffer(cellStateStorage[0], 0, cellStateArray);

const vertexBufferLayout = {
  // The first thing you give is the arrayStride. This is the number of bytes
  // the GPU needs to skip forward in the buffer when it's looking for the
  // next vertex. Each vertex of your square is made up of two 32-bit floating
  // point numbers. As mentioned earlier, a 32-bit float is 4 bytes, so two
  // floats is 8 bytes.
  arrayStride: 8,

  // Next is the attributes property, which is an array. Attributes are the
  // individual pieces of information encoded into each vertex. Your vertices
  // only contain one attribute (the vertex position),
  attributes: [
    {
      // Your vertices have two 32-bit floats each, so you use the format float32x2
      format: "float32x2",
      // Next, the offset describes how many bytes into the vertex this particular
      // attribute starts.
      offset: 0,
      // Finally, you have the shaderLocation. This is an arbitrary number between
      // 0 and 15 and must be unique for every attribute that you define. It links
      // this attribute to a particular input in the vertex shader.
      shaderLocation: 0, // Position, see vertex shader
    },
  ],
} as GPUVertexBufferLayout;

const cellShaderModule = device.createShaderModule({
  label: "Cell shader",
  code: /* wgsl */ `
    struct VertexInput {
      @location(0) pos: vec2f,
      @builtin(instance_index) instance: u32,
    };

    struct VertexOutput {
      @builtin(position) pos: vec4f,
      @location(0) cell: vec2f,
    };

    @group(0) @binding(0) var<uniform> grid: vec2f;
    @group(0) @binding(1) var<storage> cellState: array<u32>;

    @vertex
    fn vertexMain(input: VertexInput) -> VertexOutput {

      let i = f32(input.instance); // Save the instance_index as a float
      let cell = vec2f(i % grid.x, floor(i / grid.x));
      let state = f32(cellState[input.instance]);

      let cellOffset = cell / grid * 2;
      let gridPos = (input.pos * state + 1) / grid - 1 + cellOffset;

      var output: VertexOutput;
      output.pos = vec4f(gridPos, 0, 1);
      output.cell = cell;
      return output;
    }

    @fragment
    fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
      let c = input.cell/grid;
      return vec4f(c, 1-c.x, 1);
    }
  `,
});

const WORKGROUP_SIZE = 8;
const simulationShaderModule = device.createShaderModule({
  label: "Game Of Life Simulation Shader",
  code: /* wgsl */ `
    @group(0) @binding(0) var<uniform> grid: vec2f;

    @group(0) @binding(1) var<storage> cellStateIn: array<u32>;
    @group(0) @binding(2) var<storage, read_write> cellStateOut: array<u32>;


    fn cell_index(cell: vec2u)->u32 {
      return (cell.y % u32(grid.y)) * u32(grid.x) +
             (cell.x % u32(grid.x));
    }

    fn cellActive(x: u32, y: u32) -> u32 {
      return cellStateIn[cell_index(vec2(x, y))];
    }


    @compute
    @workgroup_size(${WORKGROUP_SIZE}, ${WORKGROUP_SIZE})
    fn computeMain(@builtin(global_invocation_id) cell: vec3u) {
      let i = cell_index(cell.xy);

      // Determine how many active neighbors this cell has.
      let activeNeighbors = cellActive(cell.x+1, cell.y+1) +
                            cellActive(cell.x+1, cell.y) +
                            cellActive(cell.x+1, cell.y-1) +
                            cellActive(cell.x, cell.y-1) +
                            cellActive(cell.x-1, cell.y-1) +
                            cellActive(cell.x-1, cell.y) +
                            cellActive(cell.x-1, cell.y+1) +
                            cellActive(cell.x, cell.y+1);

      switch activeNeighbors {
        case 2: { // Active cells with 2 neighbors stay active.
          cellStateOut[i] = cellStateIn[i];
        }
        case 3: { // Cells with 3 neighbors become or stay active.
          cellStateOut[i] = 1;
        }
        default: { // Cells with < 2 or > 3 neighbors become inactive.
          cellStateOut[i] = 0;
        }
      }
    }
  `,
});

const bindGroupLayout = device.createBindGroupLayout({
  label: "Cell Bind Group Layout",
  entries: [
    {
      binding: 0,
      visibility:
        GPUShaderStage.VERTEX |
        GPUShaderStage.FRAGMENT |
        GPUShaderStage.COMPUTE,
      buffer: {}, // Grid Uniform Buffer
    },
    {
      binding: 1,
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
      buffer: { type: "read-only-storage" }, // Cell State Input Buffer
    },
    {
      binding: 2,
      visibility: GPUShaderStage.COMPUTE,
      buffer: { type: "storage" }, // Cell State Output Buffer
    },
  ],
});

const pipelineLayout = device.createPipelineLayout({
  label: "Cell Pipeline Layout",
  bindGroupLayouts: [bindGroupLayout],
});

const cellPipeline = device.createRenderPipeline({
  label: "Cell pipeline",
  layout: pipelineLayout,
  vertex: {
    module: cellShaderModule,
    entryPoint: "vertexMain",
    buffers: [vertexBufferLayout],
  },
  fragment: {
    module: cellShaderModule,
    entryPoint: "fragmentMain",
    targets: [
      {
        format: canvasFormat,
      },
    ],
  },
});

const simulationPipeline = device.createComputePipeline({
  label: "Simulation Pipeline",
  layout: pipelineLayout,
  compute: {
    module: simulationShaderModule,
    entryPoint: "computeMain",
  },
});

const bindGroups = [
  device.createBindGroup({
    label: "Cell renderer bind group A",
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: { buffer: cellStateStorage[0] } },
      { binding: 2, resource: { buffer: cellStateStorage[1] } },
    ],
  }),
  device.createBindGroup({
    label: "Cell renderer bind group B",
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: { buffer: cellStateStorage[0] } },
      { binding: 2, resource: { buffer: cellStateStorage[1] } },
    ],
  }),
];

const UPDATE_INTERVAL = 500; // Update every 200ms (5 times/sec)
let step = 0; // Track how many simulation steps have been run

function updateGrid() {
  const encoder = device.createCommandEncoder();

  const computePass = encoder.beginComputePass();
  computePass.setPipeline(simulationPipeline);
  computePass.setBindGroup(0, bindGroups[step % 2]);

  const workGroupCount = Math.ceil(GRID_SIZE / WORKGROUP_SIZE);
  computePass.dispatchWorkgroups(workGroupCount, workGroupCount);

  computePass.end();

  step++;

  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        // you call createView() with no arguments on the texture, indicating
        // that you want the render pass to use the entire texture.
        view: context?.getCurrentTexture().createView(),
        // A loadOp value of "clear" indicates that you want the texture to be
        // cleared when the render pass starts.
        loadOp: "clear",
        // A storeOp value of "store" indicates that once the render pass is
        // finished you want the results of any drawing done during the render
        // pass saved into the texture.
        storeOp: "store",

        // Dont make it black, but start with a blueish
        clearValue: { r: 0, g: 0, b: 0.4, a: 1 }, // New line
      } as GPURenderPassColorAttachment,
    ],
  });

  pass.setPipeline(cellPipeline);
  pass.setVertexBuffer(0, vertexBuffer);
  pass.setBindGroup(0, bindGroups[step % 2]);
  pass.draw(vertices.length / 2, GRID_SIZE * GRID_SIZE); // 6 vertices

  // Now, end the render pass.
  pass.end();

  // It's important to know that simply making these calls does not cause the GPU
  // to actually do anything. They're just recording commands for the GPU to do
  // later into a command buffer.
  // Submit the command buffer to the GPU using the queue of the GPUDevice. The
  // queue performs all GPU commands, ensuring that their execution is well
  // ordered and properly synchronized.
  device.queue.submit([encoder.finish()]);
}

// Schedule updateGrid() to run repeatedly
setInterval(updateGrid, UPDATE_INTERVAL);

export {};
