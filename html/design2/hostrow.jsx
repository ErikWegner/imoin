export function render(hostdata) {
    const l = (
        <tr>
            <td colspan="2">{hostdata.name}</td>
            <td>{hostdata.checkresult}</td>
        </tr>
        );
    hostdata.servicesdata.unshift(l)
    return hostdata.servicesdata;
}
