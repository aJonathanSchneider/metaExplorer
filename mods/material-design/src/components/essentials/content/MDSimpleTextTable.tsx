import ldBlueprint, { } from 'ldaccess/ldBlueprint';
import { AbstractSimpleTextTable, tableHeadings, tableRows, simpleTextTableCfg } from '@metaexplorer/core/components/essentials/content/AbstractSimpleTextTable';
import { TableBody, Table, TableHead, TableRow, TableCell } from '@material-ui/core';

@ldBlueprint(simpleTextTableCfg)
export class MDSimpleTextTable extends AbstractSimpleTextTable {

	render() {
		const { localValues } = this.state;
		const headingRow = localValues.get(tableHeadings);
		const contentRows = localValues.get(tableRows);
		if (!headingRow || !contentRows) return null;
		return <Table>
			<TableHead>
				<TableRow>
					{
						(headingRow as string[]).map((headingRowElem, hIdx) => {
							return <TableCell key={"h" + hIdx}>{headingRowElem}</TableCell>;
						})
					}
				</TableRow>
			</TableHead>
			<TableBody>
				{contentRows.map((contentRow, rowIdx) => (
					<TableRow key={rowIdx}>
						{
							headingRow.map((contentKey, cIdx) => (
								<TableCell key={"c" + cIdx}>{contentRow[contentKey]}</TableCell>
							))
						}
					</TableRow>
				))}
			</TableBody>
		</Table>;
		/*<Table>
			<TableHead>
				{
					(headingRow as string[]).map((headingRowElem, hIdx) => {
						return <TableCell key={"h" + hIdx}>{headingRowElem}</TableCell>;
					})
				}
			</TableHead>
			{contentRows.map((contentRow, rowIdx) => (
				<TableRow key={rowIdx}>
					{
						headingRow.map((contentKey, cIdx) => (
							<TableCell key={"c" + cIdx}>{contentRow[contentKey]}</TableCell>
						))
					}
				</TableRow>
			))}
		</Table>;*/
	}
}
