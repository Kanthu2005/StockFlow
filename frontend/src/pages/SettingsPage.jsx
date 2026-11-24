import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import PageHeader from '../components/ui/PageHeader';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Check } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, saveSuccess } = useSettings();

  const [formData, setFormData] = useState({
    organizationName: settings.organizationName,
    contactEmail: settings.contactEmail,
    currency: settings.currency,
    timezone: settings.timezone,
    defaultThreshold: String(settings.defaultThreshold),
    enableLowStockAlerts: settings.enableLowStockAlerts,
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required.';
    }
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address.';
    }
    const threshold = Number(formData.defaultThreshold);
    if (isNaN(threshold) || threshold < 0 || !Number.isInteger(threshold)) {
      newErrors.defaultThreshold = 'Threshold must be a non-negative integer.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setTimeout(() => {
      updateSettings({
        ...formData,
        defaultThreshold: parseInt(formData.defaultThreshold, 10),
      });
      setIsSaving(false);
    }, 300);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Settings"
        description="Manage your organization profile, default inventory thresholds, and operational preferences."
      />

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in-0 duration-150">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Organization settings updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Organization Information */}
        <div className="bg-white border border-zinc-200 rounded-md p-6 space-y-4">
          <div className="pb-3 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-900">
              Organization Profile
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Primary company information used across invoices, reports, and team notifications.
            </p>
          </div>

          <div className="space-y-4 pt-1">
            <Input
              label="Organization Name"
              name="organizationName"
              value={formData.organizationName}
              onChange={(e) => handleChange('organizationName', e.target.value)}
              placeholder="e.g. Acme Logistics Ltd."
              error={errors.organizationName}
              required
            />

            <Input
              label="Primary Operations Email"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              placeholder="ops@company.com"
              helperText="System alerts and stock replenishment notices will be routed to this address."
              error={errors.contactEmail}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700 select-none">
                  Operating Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                >
                  <option value="INR (₹)">INR &mdash; Indian Rupee (₹)</option>
                  <option value="USD ($)">USD &mdash; United States Dollar ($)</option>
                  <option value="EUR (€)">EUR &mdash; Euro (€)</option>
                  <option value="GBP (£)">GBP &mdash; British Pound (£)</option>
                  <option value="CAD ($)">CAD &mdash; Canadian Dollar ($)</option>
                  <option value="AUD ($)">AUD &mdash; Australian Dollar ($)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700 select-none">
                  Reporting Timezone
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                >
                  <option value="UTC-05:00 (Eastern Time)">UTC-05:00 &mdash; Eastern Time (US & Canada)</option>
                  <option value="UTC-06:00 (Central Time)">UTC-06:00 &mdash; Central Time (US & Canada)</option>
                  <option value="UTC-08:00 (Pacific Time)">UTC-08:00 &mdash; Pacific Time (US & Canada)</option>
                  <option value="UTC+00:00 (UTC)">UTC+00:00 &mdash; Coordinated Universal Time</option>
                  <option value="UTC+05:30 (IST)">UTC+05:30 &mdash; Indian Standard Time</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Defaults */}
        <div className="bg-white border border-zinc-200 rounded-md p-6 space-y-4">
          <div className="pb-3 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-900">
              Inventory Defaults
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Default stock parameters applied automatically to newly created products.
            </p>
          </div>

          <div className="space-y-4 pt-1">
            <div className="max-w-xs">
              <Input
                label="Default Low-Stock Threshold"
                name="defaultThreshold"
                type="number"
                min="0"
                step="1"
                value={formData.defaultThreshold}
                onChange={(e) => handleChange('defaultThreshold', e.target.value)}
                helperText="Pre-filled on new product forms (can be overridden per product)."
                error={errors.defaultThreshold}
                required
              />
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enableLowStockAlerts}
                  onChange={(e) => handleChange('enableLowStockAlerts', e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-medium text-zinc-800">
                    Enable proactive low-stock email alerts
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    Receive daily digest notifications when items reach or drop below their reorder threshold.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            loading={isSaving}
          >
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}
