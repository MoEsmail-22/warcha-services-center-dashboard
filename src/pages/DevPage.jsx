/**
 * DevPage — /dev showcase route.
 *
 * Renders EVERY UI primitive + EVERY widget + the chart in one place.
 * Living documentation for the design system.
 */
import { useState } from 'react';
import { Calendar, Car, DollarSign, Star, Globe, Inbox } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// UI primitives
import {
  Button,
  Card,
  Badge,
  Input,
  Select,
  Toggle,
  Modal,
  Drawer,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from '@/components/ui';

// Widgets (Phase 4)
import {
  StatCard,
  StatusBadge,
  RatingStars,
  DataTable,
  CustomerCell,
  EmptyState,
  ErrorState,
  SkeletonStatCard,
  ProPlanCard,
  MiniTrend,
} from '@/components/widgets';

// Chart
import { RevenueBarChart } from '@/components/charts';

function DevPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toggleOn, setToggleOn] = useState(true);
  const [toggleOff, setToggleOff] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const { lang, toggleLanguage } = useLanguage();

  // Sample data for the chart
  const chartData = [
    { day: 'Mon', current: 5000 },
    { day: 'Tue', current: 6000 },
    { day: 'Wed', current: 4000 },
    { day: 'Thu', current: 8000 },
    { day: 'Fri', current: 10000 },
    { day: 'Sat', current: 6000 },
    { day: 'Sun', current: 3000 },
  ];

  // Sample data for the DataTable
  const tableColumns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => (
        <CustomerCell
          name={row.customer.name}
          initials={row.customer.initials}
          secondary={row.vehicle.model}
        />
      ),
    },
    { key: 'service', header: 'Service' },
    { key: 'time', header: 'Time' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];
  const tableData = [
    {
      id: 1,
      customer: { name: 'Hazem M.', initials: 'HM' },
      vehicle: { model: 'Toyota Corolla' },
      service: 'Oil change',
      time: '10:30 AM',
      status: 'in_service',
    },
    {
      id: 2,
      customer: { name: 'Sara K.', initials: 'SK' },
      vehicle: { model: 'Honda Civic' },
      service: 'Brake repair',
      time: '11:45 AM',
      status: 'new',
    },
    {
      id: 3,
      customer: { name: 'Omar T.', initials: 'OT' },
      vehicle: { model: 'Hyundai Elantra' },
      service: 'Tire rotation',
      time: '01:00 PM',
      status: 'confirmed',
    },
  ];

  return (
    <div className="bg-surface-page min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* ===== HEADER ===== */}
        <header>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-primary text-3xl font-bold">UI Primitives Showcase</h1>
              <p className="mt-2 text-gray-600">Every component in every variant.</p>
            </div>
            <button onClick={toggleLanguage} className="btn-outline btn-sm flex items-center gap-2">
              <Globe size={16} />
              {lang === 'ar' ? 'EN' : 'AR'}
            </button>
          </div>
        </header>
        <Card>
          <h2 className="mb-4 text-lg font-semibold">MiniTrend widget</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="w-40 text-sm text-gray-600">Positive (up):</span>
              <MiniTrend value="+2 vs yesterday" trend="up" />
            </div>
            <div className="flex items-center gap-4">
              <span className="w-40 text-sm text-gray-600">Positive (up):</span>
              <MiniTrend value="+18% this week" trend="up" />
            </div>
            <div className="flex items-center gap-4">
              <span className="w-40 text-sm text-gray-600">Negative (down):</span>
              <MiniTrend value="-5% vs last week" trend="down" />
            </div>
            <div className="flex items-center gap-4">
              <span className="w-40 text-sm text-gray-600">Neutral (no arrow):</span>
              <MiniTrend value="124 reviews" trend="neutral" showArrow={false} />
            </div>
            <div className="flex items-center gap-4">
              <span className="w-40 text-sm text-gray-600">Neutral (with arrow):</span>
              <MiniTrend value="2 awaiting approval" trend="neutral" />
            </div>
          </div>
        </Card>
        ;{/* ===== 1. BRAND COLORS ===== */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Brand colors</h2>
          <div className="flex flex-wrap gap-3">
            <div className="bg-primary flex h-20 w-32 items-end rounded-lg p-2 text-xs text-white">
              primary #0D4D47
            </div>
            <div className="bg-primary-light text-primary flex h-20 w-32 items-end rounded-lg p-2 text-xs">
              primary-light #A8D8D8
            </div>
            <div className="bg-accent flex h-20 w-32 items-end rounded-lg p-2 text-xs text-white">
              accent #FFA500
            </div>
            <div className="bg-accent-dark flex h-20 w-32 items-end rounded-lg p-2 text-xs text-white">
              accent-dark #E59400
            </div>
          </div>
        </Card>
        {/* ===== 2. BUTTONS ===== */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Buttons</h2>
          <div className="mb-4">
            <p className="mb-2 text-xs tracking-wide text-gray-500 uppercase">Variants</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="accent">Accent</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs tracking-wide text-gray-500 uppercase">Sizes</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
        </Card>
        {/* ===== 3. STATUS BADGES (old + new) ===== */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Status badges</h2>
          <p className="mb-2 text-xs tracking-wide text-gray-500 uppercase">
            Old Badge (soft tints)
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge status="pending" />
            <Badge status="confirmed" />
            <Badge status="in_service" />
            <Badge status="new" />
            <Badge status="completed" />
          </div>
          <p className="mb-2 text-xs tracking-wide text-gray-500 uppercase">
            New StatusBadge (solid colors)
          </p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="pending" />
            <StatusBadge status="confirmed" />
            <StatusBadge status="new" />
            <StatusBadge status="in_service" />
            <StatusBadge status="completed" />
            <StatusBadge status="cancelled" />
            <StatusBadge status="ready" />
            <StatusBadge status="delayed" />
            <StatusBadge status="urgent" />
            <StatusBadge status="draft" />
            <StatusBadge status="awaiting" />
            <StatusBadge status="approved" />
            <StatusBadge status="rejected" />
            <StatusBadge status="expired" />
          </div>
        </Card>
        {/* ===== 4. INPUTS ===== */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Inputs</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              id="demo-name"
              label="Customer name"
              placeholder="Ahmed Ali"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input
              id="demo-error"
              label="Phone (with error)"
              placeholder="01xxxxxxxxx"
              error="Phone number is required"
            />
            <Input placeholder="No label, just placeholder" />
            <Input placeholder="Disabled input" disabled />
          </div>
        </Card>
        {/* ===== 5. SELECT ===== */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Select</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select id="demo-status" label="Status" defaultValue="pending">
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            <Select id="demo-service" label="Service" defaultValue="">
              <option value="" disabled>
                Select a service
              </option>
              <option value="oil">Oil change</option>
              <option value="brakes">Brake repair</option>
              <option value="tire">Tire rotation</option>
            </Select>
          </div>
        </Card>
        {/* ===== 6. TOGGLE ===== */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Toggle</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <Toggle
                id="demo-toggle-on"
                label="Accept online bookings"
                description="When ON, customers can book through the website."
                checked={toggleOn}
                onChange={setToggleOn}
              />
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <Toggle
                id="demo-toggle-off"
                label="Show prices to customers"
                description="When OFF, prices are hidden from customer-facing pages."
                checked={toggleOff}
                onChange={setToggleOff}
              />
            </div>
          </div>
        </Card>
        {/* ===== 7. CARDS ===== */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Cards</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card hover className="text-center">
              <p className="text-primary text-3xl font-bold">8</p>
              <p className="mt-1 text-sm text-gray-600">Hoverable card</p>
            </Card>
            <Card hover className="text-center">
              <p className="text-accent text-3xl font-bold">3</p>
              <p className="mt-1 text-sm text-gray-600">Hover me</p>
            </Card>
            <Card hover={false} padded={false} className="overflow-hidden">
              <div className="bg-primary p-4 text-white">
                <p className="text-sm font-semibold">No padding</p>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600">For headers/footers.</p>
              </div>
            </Card>
          </div>
        </Card>
        {/* ===== 8. StatCard widget ===== */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">StatCard widget (KPI cards)</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard
              icon={<Calendar size={20} />}
              value="8"
              label="Today's bookings"
              subtext="+2 vs yesterday"
              trend="up"
            />
            <StatCard
              icon={<Car size={20} />}
              value="3"
              label="Cars in service"
              subtext="2 awaiting approval"
              trend="neutral"
            />
            <StatCard
              icon={<DollarSign size={20} />}
              value="12,450"
              label="Revenue today (EGP)"
              subtext="+18% this week"
              trend="up"
            />
            <StatCard
              icon={<Star size={20} />}
              value="4.8"
              label="Average rating"
              subtext="124 reviews"
              trend="neutral"
            />
          </div>
        </Card>
        {/* ===== 9. RatingStars widget ===== */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">RatingStars widget</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="w-32 text-sm text-gray-600">5.0</span>
              <RatingStars rating={5} size="md" showNumber />
            </div>
            <div className="flex items-center gap-4">
              <span className="w-32 text-sm text-gray-600">4.8 (partial)</span>
              <RatingStars rating={4.8} size="md" showNumber />
            </div>
            <div className="flex items-center gap-4">
              <span className="w-32 text-sm text-gray-600">3.5 (half)</span>
              <RatingStars rating={3.5} size="md" showNumber />
            </div>
            <div className="flex items-center gap-4">
              <span className="w-32 text-sm text-gray-600">2.0</span>
              <RatingStars rating={2} size="md" showNumber />
            </div>
            <div className="flex items-center gap-4">
              <span className="w-32 text-sm text-gray-600">Large size</span>
              <RatingStars rating={4.8} size="lg" showNumber />
            </div>
          </div>
        </Card>
        {/* ===== 10. ProPlanCard widget ===== */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">ProPlanCard widget</h2>
          <p className="mb-4 text-sm text-gray-600">
            Wrapped in a dark teal container to preview how it looks inside the sidebar.
          </p>
          <div className="bg-primary max-w-xs rounded-xl p-4">
            <ProPlanCard />
          </div>
        </Card>
        {/* ===== 11. DataTable widget ===== */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">DataTable widget</h2>
          <DataTable columns={tableColumns} data={tableData} rowKey="id" />
        </Card>
        {/* ===== 12. EmptyState widget ===== */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">EmptyState widget</h2>
          <EmptyState
            icon={<Inbox size={28} />}
            title="No bookings today"
            description="New bookings will appear here once customers schedule them."
            action={<Button variant="primary">New booking</Button>}
          />
        </Card>
        {/* ===== 13. ErrorState widget ===== */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">ErrorState widget</h2>
          <ErrorState
            title="Failed to load bookings"
            description="Network error: could not reach the server."
            onRetry={() => alert('Retrying...')}
          />
        </Card>
        {/* ===== 14. SkeletonCard widget ===== */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">SkeletonCard widget (loading state)</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
        </Card>
        {/* ===== 15. RevenueBarChart ===== */}
        <RevenueBarChart data={chartData} />
        {/* ===== 16. Table (basic) ===== */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Basic Table</h2>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Customer</TH>
                  <TH>Service</TH>
                  <TH>Time</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                <TR>
                  <TD>
                    <div className="font-medium text-gray-900">Hazem M.</div>
                    <div className="text-xs text-gray-500">Toyota Corolla</div>
                  </TD>
                  <TD>Oil change</TD>
                  <TD>10:30 AM</TD>
                  <TD>
                    <StatusBadge status="in_service" />
                  </TD>
                </TR>
                <TR>
                  <TD>
                    <div className="font-medium text-gray-900">Sara K.</div>
                    <div className="text-xs text-gray-500">Honda Civic</div>
                  </TD>
                  <TD>Brake repair</TD>
                  <TD>11:45 AM</TD>
                  <TD>
                    <StatusBadge status="new" />
                  </TD>
                </TR>
              </TBody>
            </Table>
          </div>
        </Card>
        {/* ===== 17. Modal + Drawer ===== */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Overlay components</h2>
          <p className="mb-4 text-sm text-gray-600">
            Click each button. Press Esc or click the backdrop to close.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              Open Modal
            </Button>
            <Button variant="outline" onClick={() => setDrawerOpen(true)}>
              Open Drawer
            </Button>
          </div>
        </Card>
      </div>

      {/* Modal demo */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create new booking"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              Save booking
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input id="modal-customer" label="Customer name" placeholder="Ahmed Ali" />
          <Input id="modal-vehicle" label="Vehicle (plate)" placeholder="ABC-1234" />
          <Select id="modal-service" label="Service" defaultValue="">
            <option value="" disabled>
              Select a service
            </option>
            <option value="oil">Oil change</option>
            <option value="brakes">Brake repair</option>
            <option value="tire">Tire rotation</option>
          </Select>
        </div>
      </Modal>

      {/* Drawer demo */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Booking details"
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => setDrawerOpen(false)}>
              Edit
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-xs tracking-wide text-gray-500 uppercase">Customer</p>
            <p className="font-medium">Ahmed Ali</p>
          </div>
          <div>
            <p className="text-xs tracking-wide text-gray-500 uppercase">Vehicle</p>
            <p className="font-medium">Toyota Corolla — ABC-1234</p>
          </div>
          <div>
            <p className="text-xs tracking-wide text-gray-500 uppercase">Status</p>
            <div className="mt-1">
              <StatusBadge status="confirmed" />
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

export default DevPage;
