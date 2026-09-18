import { useMemo, useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { INITIAL_BRANDS, MARKET_BRANDS } from '@/mocks/vehicleBrands';
import {
  Button,
  Card,
  Input,
  Modal,
  Table,
  TBody,
  TD,
  TH,
  THead,
  Toggle,
  TR,
} from '@/components/ui';

export default function VehicleCatalogDemo() {
  const { t } = useAppTranslation('services');
  const { isRTL } = useLanguage();
  const catalogText = (key, defaultValue, options) =>
    t(`vehicleCatalog.${key}`, { defaultValue, ...options });
  const [brands, setBrands] = useState(INITIAL_BRANDS);
  const [marketSearch, setMarketSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [brandPickerOpen, setBrandPickerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const availableBrands = useMemo(
    () =>
      MARKET_BRANDS.filter(
        (brand) =>
          brand.toLowerCase().includes(marketSearch.toLowerCase()) &&
          !brands.some((item) => item.brand === brand)
      ),
    [brands, marketSearch]
  );

  const toggleBrand = (id) => {
    setBrands((current) =>
      current.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  const deleteBrand = (id) => setBrands((current) => current.filter((item) => item.id !== id));

  const addBrand = () => {
    if (!selectedBrand) return;

    setBrands((current) => [
      ...current,
      {
        id: `B-${String(current.length + 1).padStart(3, '0')}`,
        brand: selectedBrand,
        active: true,
      },
    ]);
    setSelectedBrand('');
    setMarketSearch('');
    setBrandPickerOpen(false);
    setModalOpen(false);
  };

  return (
    <section className="mt-8 w-full max-w-2xl lg:w-fit" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#15201F]">
            {catalogText('title', 'Vehicle catalog')}
          </h2>
          <p className="mt-1 text-xs text-[#5A6968]">
            {catalogText('subtitle', 'Manage customer car brands.')}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          {catalogText('addBrand', 'Add brand')}
        </Button>
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto px-4 pb-4">
          <Table className="w-auto min-w-[520px]">
            <THead>
              <TR className="hover:bg-gray-50">
                <TH className="px-3 py-2.5 whitespace-nowrap">
                  {catalogText('table.brand', 'Brand')}
                </TH>
                <TH className="px-3 py-2.5 whitespace-nowrap">
                  {catalogText('table.status', 'Status')}
                </TH>
                <TH className="px-3 py-2.5 text-end whitespace-nowrap">
                  {catalogText('table.actions', 'Actions')}
                </TH>
              </TR>
            </THead>
            <TBody>
              {brands.length === 0 ? (
                <TR>
                  <TD colSpan={3} className="px-3 py-10 text-center text-sm text-gray-500">
                    {catalogText('noBrands', 'No brands found.')}
                  </TD>
                </TR>
              ) : (
                brands.map((item) => (
                  <TR key={item.id}>
                    <TD className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F6F3EE] text-xs font-bold text-[#8A8074]">
                          {item.brand.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1C1712]">{item.brand}</p>
                          <p className="text-xs text-[#A89A8A]">{item.id}</p>
                        </div>
                      </div>
                    </TD>
                    <TD className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <Toggle
                          id={`vehicle-brand-${item.id}`}
                          checked={item.active}
                          onChange={() => toggleBrand(item.id)}
                        />
                        <span
                          className={
                            item.active
                              ? 'text-sm font-medium text-emerald-700'
                              : 'text-sm font-medium text-gray-500'
                          }
                        >
                          {item.active
                            ? catalogText('status.active', 'Active')
                            : catalogText('status.inactive', 'Inactive')}
                        </span>
                      </div>
                    </TD>
                    <TD className="px-3 py-2.5 text-end whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => deleteBrand(item.id)}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label={catalogText('actions.deleteBrand', `Delete ${item.brand}`, {
                          brand: item.brand,
                        })}
                        title={catalogText('actions.deleteBrand', `Delete ${item.brand}`, {
                          brand: item.brand,
                        })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={catalogText('modal.title', 'Add a vehicle brand')}
        size="lg"
        contentClassName="min-h-[300px]"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              {catalogText('actions.cancel', 'Cancel')}
            </Button>
            <Button type="button" onClick={addBrand} disabled={!selectedBrand}>
              {catalogText('addBrand', 'Add brand')}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-[#1C1712]">
              {catalogText('modal.searchTitle', 'Search the market catalog')}
            </p>
            <p className="mt-1 text-xs text-[#7D7166]">
              {catalogText(
                'modal.searchDescription',
                'Select a brand to make it available to customers.'
              )}
            </p>
          </div>
          <div className="relative">
            <label htmlFor="market-brand-search" className="label">
              {catalogText('fields.brand', 'Vehicle brand')}
            </label>
            <div className="relative">
              <Input
                id="market-brand-search"
                value={marketSearch}
                onChange={(event) => {
                  setMarketSearch(event.target.value);
                  setSelectedBrand('');
                  setBrandPickerOpen(true);
                }}
                onFocus={() => setBrandPickerOpen(true)}
                placeholder={catalogText(
                  'fields.searchPlaceholder',
                  'Search Toyota, BMW, Hyundai...'
                )}
                aria-label={catalogText('fields.searchLabel', 'Search market brands')}
                role="combobox"
                aria-expanded={brandPickerOpen}
                aria-controls="market-brand-options"
                className="ps-10"
              />
              <Search className="pointer-events-none absolute start-3 top-3 h-4 w-4 text-[#A89A8A]" />
            </div>
            {brandPickerOpen && (
              <div
                id="market-brand-options"
                className="absolute inset-x-0 top-full z-10 mt-1 max-h-52 overflow-y-auto rounded-xl border border-[#E8E2D8] bg-white py-1 shadow-lg"
                role="listbox"
              >
                {availableBrands.length > 0 ? (
                  availableBrands.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      role="option"
                      aria-selected={selectedBrand === brand}
                      onClick={() => {
                        setSelectedBrand(brand);
                        setMarketSearch(brand);
                        setBrandPickerOpen(false);
                      }}
                      className="flex w-full items-center justify-between px-3 py-2.5 text-start text-sm text-[#1C1712] hover:bg-[#F6F3EE]"
                    >
                      <span className="font-medium">{brand}</span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-3 text-sm text-[#7D7166]">
                    {catalogText('noBrands', 'No brands found.')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </section>
  );
}
