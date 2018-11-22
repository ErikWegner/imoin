export function render(servicedata) {
    return (
        <tr>
            <td>{servicedata.host.name}</td>
            <td>{servicedata.name}</td>
            <td>{servicedata.checkresult}</td>
        </tr>) 
}
