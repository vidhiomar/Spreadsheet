import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Card } from 'primereact/card';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import IconButton from '@mui/material/IconButton';

interface Data {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string | null;
    date_start: number;
    date_end: number;
}

export default function ProductTable() {
    const [products, setProducts] = useState<Data[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const rows = 8;
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [showPanel, setShowPanel] = useState(false);
    const [rowsToSelect, setRowsToSelect] = useState<number>(0);
    const [selecting, setSelecting] = useState(false);

    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`);
            const json = await res.json();
            const mapped = json.data.map((item: any) => ({
                id: item.id,
                title: item.title,
                place_of_origin: item.place_of_origin,
                artist_display: item.artist_display,
                inscriptions: item.inscriptions,
                date_start: item.date_start,
                date_end: item.date_end,
            }));
            setProducts(mapped);
            setTotalRecords(json.pagination.total);
            setLoading(false);
        };
        getData();
    }, [page]);

    const onPage = (event: any) => {
        setPage(event.page + 1);
    };

    const selectedProducts = products.filter(row => selectedIds.has(row.id));

    const titleHeader = (
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <IconButton
                size="small"
                style={{ marginRight: 8 }}
                onClick={e => {
                    e.stopPropagation();
                    setShowPanel(s => !s);
                }}
                aria-label="Open selection panel"
            >
                <ArrowDropDownIcon />
            </IconButton>
            <span>Title</span>
            {showPanel && (
                <div style={{
                    background: '#fff',
                    border: '1px solid #d1d9e6',
                    borderRadius: 8,
                    padding: 16,
                    marginTop: 8,
                    boxShadow: '0 2px 8px #d1d9e6',
                    maxWidth: 320,
                    zIndex: 100,
                    position: 'absolute',
                    left: 0,
                    top: '100%'
                }}>
                    <label>
                        Select how many rows:&nbsp;
                        <input
                            type="number"
                            min={1}
                            value={rowsToSelect}
                            onChange={e => setRowsToSelect(Number(e.target.value))}
                            style={{ width: 60 }}
                        />
                    </label>
                    <button
                        className="p-button p-component"
                        style={{ marginLeft: 12 }}
                        onClick={async () => {
                            setSelecting(true);
                            let selected = new Set(selectedIds);
                            let pageNum = page; // start from current page
                            let selectedCount = 0;
                            let localProducts = [...products];
                            for (const row of localProducts) {
                                if (!selected.has(row.id)) {
                                    selected.add(row.id);
                                    selectedCount++;
                                    if (selectedCount >= rowsToSelect) break;
                                }
                            }
                            while (selectedCount < rowsToSelect) {
                                pageNum++;
                                const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${pageNum}`);
                                const json = await res.json();
                                const mapped = json.data.map((item: any) => ({
                                    id: item.id,
                                    title: item.title,
                                    place_of_origin: item.place_of_origin,
                                    artist_display: item.artist_display,
                                    inscriptions: item.inscriptions,
                                    date_start: item.date_start,
                                    date_end: item.date_end,
                                }));
                                for (const row of mapped) {
                                    if (!selected.has(row.id)) {
                                        selected.add(row.id);
                                        selectedCount++;
                                        if (selectedCount >= rowsToSelect) break;
                                    }
                                }
                                if (!json.pagination.next_url) break;
                            }
                            setSelectedIds(selected);
                            setSelecting(false);
                            setShowPanel(false);
                        }}
                        disabled={selecting || rowsToSelect < 1}
                    >
                        {selecting ? "Selecting..." : "Select"}
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div style={{ background: '#f4f6fb', width: '100vw', overflow: 'hidden' }}>
            <Card style={{ height: '100vh', width: '100vw', maxWidth: '100vw', boxShadow: '0 2px 8px #d1d9e6', margin: 0, borderRadius: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
                <DataTable
                    scrollable scrollHeight={`calc(100vh - 120px)`}
                    style={{ width: '100%', maxWidth: '100vw', minHeight: 0, flex: 1 }}
                    showGridlines value={products} paginator first={(page - 1) * rows}
                    rows={rows} totalRecords={totalRecords} onPage={onPage}
                    lazy
                    loading={loading}
                    stripedRows
                    emptyMessage="No artworks found."
                    selectionMode="multiple"
                    selection={selectedProducts}
                    onSelectionChange={e => {
                        const newSelectedIds = new Set(selectedIds);
                        e.value.forEach((row: Data) => newSelectedIds.add(row.id));
                        products.forEach(row => {
                            if (!e.value.some((selected: Data) => selected.id === row.id)) {
                                newSelectedIds.delete(row.id);
                            }
                        });
                        setSelectedIds(newSelectedIds);
                    }}
                    dataKey="id"
                    paginatorTemplate="PrevPageLink PageLinks NextPageLink "
                    paginatorClassName="custom-paginator"
                >
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
                    <Column field="title" header={titleHeader} style={{ minWidth: '200px' }} />
                    <Column field="place_of_origin" header="Place of Origin" style={{ minWidth: '150px' }} />
                    <Column field="artist_display" header="Artist Display" style={{ minWidth: '200px' }} />
                    <Column field="inscriptions" header="Inscriptions" style={{ minWidth: '200px' }} />
                    <Column field="date_start" header="Date Start" style={{ minWidth: '100px' }} />
                    <Column field="date_end" header="Date End" style={{ minWidth: '100px' }} />
                </DataTable>
                {loading && (
                    <div className="p-d-flex p-jc-center">
                        <ProgressSpinner style={{ width: '90px', height: '50px' }} strokeWidth="4" />
                    </div>
                )}
            </Card>
        </div>
    );
}
