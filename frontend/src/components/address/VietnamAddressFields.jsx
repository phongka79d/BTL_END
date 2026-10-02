import React, { useEffect, useId, useState } from 'react';
import { Button, FormLayout, Selector, TextInput } from '@astryxdesign/core';
import { addressApi } from '../../api/addressApi.js';
import { formatVietnamAddress } from '../../utils/addressFormatter.js';
import {
  changeProvince,
  changeWard,
  EMPTY_ADDRESS
} from './addressFormUtils.js';

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

  const [provinces, setProvinces] = useState([]);
  const [provincesLoading, setProvincesLoading] = useState(true);
  const [provincesFailed, setProvincesFailed] = useState(false);
  const [provinceRetry, setProvinceRetry] = useState(0);
  const [wards, setWards] = useState([]);
  const [wardsProvinceCode, setWardsProvinceCode] = useState('');
  const [wardsLoading, setWardsLoading] = useState(false);
  const [wardsFailed, setWardsFailed] = useState(false);
  const [wardRetry, setWardRetry] = useState(0);

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


  const handleProvinceChange = (selectedCode) => {
    const selectedProvince = provinces.find((item) => item.code === selectedCode);
    if (!selectedProvince) return;
    onChange?.(changeProvince(address, selectedProvince));
  };

  const handleWardChange = (selectedCode) => {
    const selectedWard = wards.find((item) => item.code === selectedCode);
    if (!selectedWard) return;
    onChange?.(changeWard(address, selectedWard));
  };


  const runBlur = (field) => (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    onBlur?.(field);
  };


  const provinceOptions = asSelectorOptions(provinces);
  const currentWards = wardsProvinceCode === provinceCode ? wards : [];
  const wardOptions = asSelectorOptions(currentWards);
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

        <div id={`${prefix}-detail`} style={FIELD_STYLE}>
          <TextInput
            label="Số nhà, tên đường"
            value={detail}
            onChange={(nextDetail) => onChange?.({
              provinceCode,
              provinceName: typeof address.provinceName === 'string' ? address.provinceName : '',
              wardCode,
              wardName: typeof address.wardName === 'string' ? address.wardName : '',
              detail: nextDetail
            })}
            onBlur={() => onBlur?.('detail')}
            placeholder="Ví dụ: Số 12, ngõ 5, Phố Hàng Bài"
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
