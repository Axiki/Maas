import React, { useEffect, useMemo, useState } from 'react';
import { Search, UserRound, X } from 'lucide-react';

import { MotionWrapper } from '../../ui/MotionWrapper';
import { Customer } from '../../../types';
import { getCustomerById, useCustomerProfiles } from '../../../data/mockCustomers';

interface CustomerPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
}

export const CustomerPickerModal: React.FC<CustomerPickerModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [search, setSearch] = useState('');
  const profiles = useCustomerProfiles(search);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  const sortedProfiles = useMemo(
    () =>
      profiles.slice().sort((a, b) => {
        const aScore = a.loyaltyPoints + a.storeCreditBalance;
        const bScore = b.loyaltyPoints + b.storeCreditBalance;
        return bScore - aScore;
      }),
    [profiles],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-10">
      <div className="absolute inset-0" aria-hidden onClick={onClose} />
      <MotionWrapper
        type="modal"
        className="relative z-10 w-full max-w-2xl rounded-2xl border border-[#D6D6D6]/80 bg-surface-100 p-6 shadow-modal"
      >
        <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#24242E]">Link a customer</h2>
            <p className="text-sm text-muted">
              Search loyalty members to attach them to the order for points and rewards.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="self-end rounded-full border border-[#D6D6D6] p-2 text-[#24242E] transition hover:bg-[#EE766D] hover:text-white"
            aria-label="Close customer picker"
          >
            <X size={18} />
          </button>
        </header>

        <div className="relative mb-5">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#24242E]/50" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-full border border-[#D6D6D6] bg-white py-2 pl-10 pr-4 text-sm text-[#24242E] shadow-sm transition focus:border-[#EE766D] focus:ring-2 focus:ring-[#EE766D]/30"
            placeholder="Search by name, phone, or tags"
            autoFocus
          />
        </div>

        <div className="max-h-80 overflow-y-auto">
          {sortedProfiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#D6D6D6] bg-surface-200/60 py-12 text-center text-sm text-muted">
              <UserRound size={28} className="text-[#EE766D]" />
              <div>
                <p>No customers match that search.</p>
                <p className="text-xs">Try searching for a different spelling or tag.</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {sortedProfiles.map((profile) => {
                const customer = getCustomerById(profile.id);
                if (!customer) return null;

                return (
                  <li key={profile.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(customer);
                        onClose();
                      }}
                      className="w-full rounded-xl border border-[#D6D6D6]/70 bg-white px-4 py-3 text-left transition hover:border-[#EE766D] hover:bg-[#EE766D]/10"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-[#24242E]">{profile.name}</p>
                          <p className="text-xs text-muted">
                            {profile.email || 'No email'}
                            {profile.phone && <span className="ml-2">• {profile.phone}</span>}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#24242E]">{profile.loyaltyPoints} pts</p>
                          <p className="text-xs text-muted">Credit {profile.storeCreditBalance.toFixed(2)}</p>
                        </div>
                      </div>
                      {profile.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          {profile.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-[#D6D6D6]/60 px-3 py-1 text-[#24242E]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </MotionWrapper>
    </div>
  );
};

export default CustomerPickerModal;
