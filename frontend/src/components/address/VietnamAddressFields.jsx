import React, { useEffect, useId, useMemo, useState } from 'react';
import { Button, FormLayout, Selector, TextInput, Typeahead } from '@astryxdesign/core';
import { addressApi } from '../../api/addressApi.js';
import { formatVietnamAddress } from '../../utils/addressFormatter.js';
import {
  changeProvince,
  changeStreet,
  changeWard,
  EMPTY_ADDRESS
} from './addressFormUtils.js';

const STREET_DEBOUNCE_MS = 350;
const MIN_STREET_QUERY_LENGTH = 2;
const ROOT_STYLE = { width: '100%', minWidth: 0 };
const FIELD_STYLE = { width: '100%', minWidth: 0 };
const STATUS_STYLE = {
  alignItems: 'center',
  color: 'var(--color-text-secondary)',
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--spacing-2)',
  margin: 'var(--spacing-2) 0 0',
  minWidth: 0
};
const ERROR_STATUS_STYLE = {
  ...STATUS_STYLE,
  color: 'var(--color-text-red)'
};
const PREVIEW_STYLE = {
  backgroundColor: 'var(--color-background-muted)',
  borderRadius: 'var(--radius-element)',
  color: 'var(--color-text-primary)',
  display: 'grid',
  gap: 'var(--spacing-1)',
  minWidth: 0,
  padding: 'var(--spacing-3)'
};
const PREVIEW_LABEL_STYLE = {
  color: 'var(--color-text-secondary)',
  fontSize: '0.875rem'
};
const PREVIEW_VALUE_STYLE = {
  display: 'block',
  margin: 0,
  minWidth: 0,
  overflowWrap: 'anywhere',
  width: '100%'
};

const fieldStatus = (message) => (
  message ? { type: 'error', message } : undefined
);

const readItems = (response) => (
  Array.isArray(response?.data?.items) ? response.data.items : null
);

const toUnitOptions = (items) => items
  .filter((item) => (
    item
    && typeof item.code === 'string'
    && item.code.trim() !== ''
    && typeof item.name === 'string'
    && item.name.trim() !== ''
  ))
  .map((item) => ({ ...item, code: item.code.trim(), name: item.name.trim() }));

const toStreetItems = (items) => items
  .filter((item) => (
    item
    && typeof item.ref === 'string'
    && item.ref.trim() !== ''
    && typeof item.name === 'string'
    && item.name.trim() !== ''
  ))
  .map((item) => ({
    id: item.ref.trim(),
    label: typeof item.displayName === 'string' && item.displayName.trim()
      ? item.displayName.trim()
      : item.name.trim(),
    auxiliaryData: { ref: item.ref.trim(), name: item.name.trim() }
  }));

const asSelectorOptions = (items) => items.map((item) => ({
  value: item.code,
  label: item.name
}));


export const VietnamAddressFields = ({
  value = EMPTY_ADDRESS,
  onChange,
  onBlur,
  errors = {},
  disabled = false,
  required = false,
  idPrefix
}) => {
  const generatedId = useId();
  const prefix = idPrefix || `vietnam-address-${generatedId}`;
  const address = value && typeof value === 'object' ? value : EMPTY_ADDRESS;
  const provinceCode = typeof address.provinceCode === 'string' ? address.provinceCode : '';
  const wardCode = typeof address.wardCode === 'string' ? address.wardCode : '';
  const areaKey = `${provinceCode}\u0000${wardCode}`;

  const [provinces, setProvinces] = useState([]);
  const [provincesLoading, setProvincesLoading] = useState(true);
  const [provincesFailed, setProvincesFailed] = useState(false);
  const [provinceRetry, setProvinceRetry] = useState(0);
  const [wards, setWards] = useState([]);
  const [wardsProvinceCode, setWardsProvinceCode] = useState('');
  const [wardsLoading, setWardsLoading] = useState(false);
  const [wardsFailed, setWardsFailed] = useState(false);
  const [wardRetry, setWardRetry] = useState(0);
  const [streetFailed, setStreetFailed] = useState(false);
  const [streetQueryLength, setStreetQueryLength] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setProvincesLoading(true);
    setProvincesFailed(false);

    addressApi.getProvinces({ signal: controller.signal })
      .then((response) => {
        const items = readItems(response);
        if (active) {
          if (items === null) {
            setProvinces([]);
            setProvincesFailed(true);
          } else {
            setProvinces(toUnitOptions(items));
          }
        }
      })
      .catch(() => {
        if (active && !controller.signal.aborted) {
          setProvinces([]);
          setProvincesFailed(true);
        }
      })
      .finally(() => {
        if (active) setProvincesLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [provinceRetry]);

  useEffect(() => {
    if (!provinceCode) {
      setWards([]);
      setWardsProvinceCode('');
      setWardsLoading(false);
      setWardsFailed(false);
      return undefined;
    }

    const controller = new AbortController();
    let active = true;
    setWards([]);
    setWardsProvinceCode('');
    setWardsLoading(true);
    setWardsFailed(false);

    addressApi.getWards(provinceCode, { signal: controller.signal })
      .then((response) => {
        const items = readItems(response);
        if (active) {
          if (items === null) {
            setWards([]);
            setWardsFailed(true);
          } else {
            setWards(toUnitOptions(items));
            setWardsProvinceCode(provinceCode);
          }
        }
      })
      .catch(() => {
        if (active && !controller.signal.aborted) {
          setWards([]);
          setWardsFailed(true);
        }
      })
      .finally(() => {
        if (active) setWardsLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [provinceCode, wardRetry]);


  // One search source per selected ward: users can only pick a returned street, never keep typed text.
  const streetSource = useMemo(() => {
    let controller = null;
    return {
      bootstrap: () => [],
      cancel() {
        controller?.abort();
        controller = null;
      },
      async search(query) {
        this.cancel();
        const normalizedQuery = query.trim();
        if (!provinceCode || !wardCode || normalizedQuery.length < MIN_STREET_QUERY_LENGTH) return [];
        const current = new AbortController();
        controller = current;
        try {
          const response = await addressApi.searchStreets({
            provinceCode,
            wardCode,
            query: normalizedQuery,
            signal: current.signal
          });
          const items = readItems(response);
          if (items === null) throw new Error('Invalid street response');
          setStreetFailed(false);
          return toStreetItems(items);
        } catch {
          if (!current.signal.aborted) setStreetFailed(true);
          return [];
        }
      }
    };
  }, [provinceCode, wardCode]);

  const clearStreetSearch = () => {
    setStreetFailed(false);
    setStreetQueryLength(0);
  };

  const handleProvinceChange = (selectedCode) => {
    const selectedProvince = provinces.find((item) => item.code === selectedCode);
    if (!selectedProvince) return;
    clearStreetSearch();
    onChange?.(changeProvince(address, selectedProvince));
  };

  const handleWardChange = (selectedCode) => {
    const selectedWard = wards.find((item) => item.code === selectedCode);
    if (!selectedWard) return;
    clearStreetSearch();
    onChange?.(changeWard(address, selectedWard));
  };

  const handleStreetQueryChange = (query) => {
    setStreetQueryLength(query.trim().length);
    setStreetFailed(false);
  };

  const handleStreetSelection = (item) => {
    setStreetFailed(false);
    onChange?.(changeStreet(address, item ? item.auxiliaryData : null));
  };

  const runBlur = (field) => (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    onBlur?.(field);
  };

  const provinceOptions = asSelectorOptions(provinces);
  const currentWards = wardsProvinceCode === provinceCode ? wards : [];
  const wardOptions = asSelectorOptions(currentWards);
  const streetName = typeof address.streetName === 'string' ? address.streetName : '';
  const streetRef = typeof address.streetRef === 'string' ? address.streetRef : '';
  const detail = typeof address.detail === 'string' ? address.detail : '';
  const addressPreview = formatVietnamAddress(address);

  return (
    <div id={`${prefix}-container`} style={ROOT_STYLE}>
      <FormLayout>
        <div id={`${prefix}-province`} style={FIELD_STYLE} onBlur={runBlur('provinceCode')}>
          <Selector
            label="Tỉnh/Thành phố"
            options={provinceOptions}
            value={provinceCode || undefined}
            onChange={handleProvinceChange}
            placeholder="Chọn Tỉnh/Thành phố"
            status={fieldStatus(errors.provinceCode)}
            isRequired={required}
            isDisabled={disabled || provincesLoading || provinces.length === 0}
            isLoading={provincesLoading}
            width="100%"
          />
          {provincesLoading && (
            <p role="status" aria-live="polite" style={STATUS_STYLE}>Đang tải danh sách Tỉnh/Thành phố…</p>
          )}
          {provincesFailed && (
            <div role="alert" style={ERROR_STATUS_STYLE}>
              <span>Không thể tải danh sách Tỉnh/Thành phố. Vui lòng thử lại.</span>
              <Button
                type="button"
                label="Thử lại danh sách Tỉnh/Thành phố"
                variant="ghost"
                size="sm"
                isDisabled={disabled || provincesLoading}
                onClick={() => setProvinceRetry((retry) => retry + 1)}
              />
            </div>
          )}
        </div>

        <div id={`${prefix}-ward`} style={FIELD_STYLE} onBlur={runBlur('wardCode')}>
          <Selector
            label="Phường/Xã"
            options={wardOptions}
            value={wardCode || undefined}
            onChange={handleWardChange}
            placeholder={provinceCode ? 'Chọn Phường/Xã' : 'Chọn Tỉnh/Thành phố trước'}
            status={fieldStatus(errors.wardCode)}
            isRequired={required}
            isDisabled={disabled || !provinceCode || wardsLoading || currentWards.length === 0}
            isLoading={wardsLoading}
            width="100%"
          />
          {wardsLoading && (
            <p role="status" aria-live="polite" style={STATUS_STYLE}>Đang tải danh sách Phường/Xã…</p>
          )}
          {wardsFailed && (
            <div role="alert" style={ERROR_STATUS_STYLE}>
              <span>Không thể tải danh sách Phường/Xã. Vui lòng thử lại.</span>
              <Button
                type="button"
                label="Thử lại danh sách Phường/Xã"
                variant="ghost"
                size="sm"
                isDisabled={disabled || wardsLoading}
                onClick={() => setWardRetry((retry) => retry + 1)}
              />
            </div>
          )}
        </div>

        <div id={`${prefix}-street`} style={FIELD_STYLE} onBlur={runBlur('streetRef')}>
          <Typeahead
            key={areaKey}
            label="Đường/Phố"
            searchSource={streetSource}
            value={streetRef && streetName ? { id: streetRef, label: streetName, auxiliaryData: { ref: streetRef, name: streetName } } : null}
            onChange={handleStreetSelection}
            onChangeQuery={handleStreetQueryChange}
            debounceMs={STREET_DEBOUNCE_MS}
            placeholder={provinceCode && wardCode ? 'Gõ ít nhất 2 ký tự rồi chọn đường/phố' : 'Chọn Tỉnh/Thành phố và Phường/Xã trước'}
            emptySearchResultsText={streetQueryLength < MIN_STREET_QUERY_LENGTH ? 'Nhập ít nhất 2 ký tự để tìm đường/phố.' : 'Không tìm thấy đường/phố phù hợp.'}
            status={fieldStatus(errors.streetRef)}
            isRequired={required}
            isDisabled={disabled || !provinceCode || !wardCode}
            width="100%"
          />
          {streetFailed && (
            <p role="alert" style={ERROR_STATUS_STYLE}>
              Không thể tra cứu tên đường lúc này. Hãy gõ lại để thử lại.
            </p>
          )}
        </div>

        <div id={`${prefix}-detail`} style={FIELD_STYLE}>
          <TextInput
            label="Số nhà/ngõ/ngách hoặc thông tin chi tiết"
            value={detail}
            onChange={(nextDetail) => onChange?.({
              provinceCode,
              provinceName: typeof address.provinceName === 'string' ? address.provinceName : '',
              wardCode,
              wardName: typeof address.wardName === 'string' ? address.wardName : '',
              streetRef,
              streetName,
              detail: nextDetail
            })}
            onBlur={() => onBlur?.('detail')}
            placeholder="Ví dụ: Số 12, ngõ 5"
            status={fieldStatus(errors.detail)}
            isRequired={required}
            isDisabled={disabled}
            width="100%"
          />
        </div>

        <div id={`${prefix}-preview`} style={PREVIEW_STYLE}>
          <span style={PREVIEW_LABEL_STYLE}>Địa chỉ đầy đủ</span>
          <output aria-label="Địa chỉ đầy đủ" aria-live="polite" style={PREVIEW_VALUE_STYLE}>
            {addressPreview || 'Chưa có địa chỉ đầy đủ'}
          </output>
          {errors.address && <p role="alert" style={STATUS_STYLE}>{errors.address}</p>}
        </div>
      </FormLayout>
    </div>
  );
};

export default VietnamAddressFields;
