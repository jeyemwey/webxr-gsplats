type Props = {
    d: Date;
    hideDateIfToday?: boolean;
}

export const DateFormat = ({d, hideDateIfToday}: Props) => {

    const showDate = !(hideDateIfToday && ((new Date(d)).setHours(0, 0, 0, 0) === (new Date()).setHours(0, 0, 0, 0)));

    const intl = new Intl.DateTimeFormat("de-DE", {
        weekday: showDate ? 'short' : undefined,
        year: showDate ? 'numeric' : undefined,
        month: showDate ? 'short' : undefined,
        day: showDate ? 'numeric' : undefined,
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
    });
    const output = intl.format(d);


    return <span><time dateTime={d.toISOString()}>
        {output}{showDate && " Uhr"}
    </time></span>
}
