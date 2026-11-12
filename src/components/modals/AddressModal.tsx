/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, MapPin, Plus, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { POPULAR_LOCATIONS } from '../../data/mockData';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose }) => {
  const { addresses, activeAddress, setActiveAddress, addDeliveryAddress } = useAuth();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [label, setLabel] = useState('Home');
  const [addressLine, setAddressLine] = useState('');
  const [area, setArea] = useState('Banani');
  const [landmark, setLandmark] = useState('');
  const [phone, setPhone] = useState('+880 1712-345678');

  if (!isOpen) return null;

  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine.trim()) return;

    await addDeliveryAddress({
      label,
      addressLine,
      area,
      city: 'Dhaka',
      landmark: landmark.trim() || undefined,
      phone: phone.trim() || undefined,
      isDefault: true,
    });

    setIsAddingNew(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#181922] border border-[#2d3042] rounded-3xl p-6 shadow-2xl relative space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#FF6B35]" />
            <span>Select Delivery Address</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#222432] text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isAddingNew ? (
          <>
            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {addresses.map((addr) => {
                const isSelected = activeAddress?.id === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => {
                      setActiveAddress(addr);
                      onClose();
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                      isSelected
                        ? 'bg-[#FF6B35]/15 border-[#FF6B35] text-white'
                        : 'bg-[#14151d] border-[#252838] text-neutral-300 hover:border-neutral-500'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#222432] flex items-center justify-center text-xs shrink-0 mt-0.5">
                        {addr.label === 'Work' ? '💼' : '🏠'}
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-2">
                          <span>{addr.label}</span>
                          <span className="text-[10px] text-neutral-400 font-normal">
                            ({addr.area}, {addr.city})
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          {addr.addressLine}
                        </div>
                        {addr.landmark && (
                          <div className="text-[10px] text-neutral-500 mt-0.5">
                            Landmark: {addr.landmark}
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#FF6B35] shrink-0" />}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setIsAddingNew(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-[#FF6B35]/60 hover:bg-[#FF6B35]/10 text-[#FF6B35] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </>
        ) : (
          /* Add New Address Form */
          <form onSubmit={handleAddNew} className="space-y-3">
            <div className="flex gap-2">
              {['Home', 'Work', 'Other'].map((l) => (
                <button
                  type="button"
                  key={l}
                  onClick={() => setLabel(l)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border ${
                    label === l
                      ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                      : 'bg-[#14151d] text-neutral-400 border-[#252838]'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-300">Neighborhood / Area</label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-xs text-white font-bold"
              >
                {POPULAR_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.area}>
                    {loc.area}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-300">Detailed Address Line</label>
              <textarea
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="House / Flat #, Road #, Building name"
                required
                rows={2}
                className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6B35]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-300">Landmark (Optional)</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Mosque or Lake Park"
                className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-300">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1712-345678"
                className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#252838] text-neutral-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#ff5722] text-white text-xs font-bold shadow-md"
              >
                Save & Select
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
