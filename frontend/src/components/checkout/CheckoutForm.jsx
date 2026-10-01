import React from 'react';
import {
  Badge,
  Card,
  FormLayout,
  HStack,
  Text,
  TextArea,
  TextInput,
  VStack
} from '@astryxdesign/core';

/**
 * CheckoutForm
 *
 * Thu thập địa chỉ giao hàng và hiển thị phương thức thanh toán COD (chỉ mang tính thông tin).
 * Lỗi kiểm tra được hiển thị nội tuyến thông qua các thuộc tính status của trường Astryx.
 *
 * ponytail: Nếu bổ sung phương thức thanh toán hoặc trường địa chỉ,
 *           hãy mở rộng thành phần này mà không thay đổi hợp đồng gửi dữ liệu.
 */

const fieldStatus = (message) =>
  message ? { type: 'error', message } : undefined;

export const CheckoutForm = ({
  values,
  errors,
  touched,
  onChange,
  onBlur
}) => {
  return (
    <Card padding={4}>
      <VStack gap={4}>
        <VStack gap={1}>
          <Text size="supporting" color="accent" weight="semibold">
            Shipping information
          </Text>
          <Text color="secondary">
            Fill in your delivery details. All fields marked * are required.
          </Text>
        </VStack>

        <FormLayout>
          <TextInput
            label="Full name *"
            value={values.fullName}
            onChange={(value) => onChange('fullName', value)}
            onBlur={() => onBlur('fullName')}
            status={fieldStatus(touched.fullName && errors.fullName)}
            width="100%"
          />

          <TextInput
            label="Phone number *"
            value={values.phone}
            inputMode="numeric"
            onChange={(value) => onChange('phone', value)}
            onBlur={() => onBlur('phone')}
            status={fieldStatus(touched.phone && errors.phone)}
          />

          <TextArea
            label="Shipping address *"
            value={values.shippingAddress}
            onChange={(value) => onChange('shippingAddress', value)}
            onBlur={() => onBlur('shippingAddress')}
            rows={3}
            status={fieldStatus(
              touched.shippingAddress && errors.shippingAddress
            )}
            width="100%"
          />

          <TextArea
            label="Order note"
            value={values.note}
            onChange={(value) => onChange('note', value)}
            rows={2}
            isOptional
            width="100%"
          />
        </FormLayout>

        <Card padding={3}>
          <VStack gap={2}>
            <HStack gap={3} style={{ alignItems: 'center' }}>
              <Text weight="semibold">Phương thức thanh toán</Text>
              <Badge variant="info">COD</Badge>
            </HStack>
            <Text color="secondary">
              Thanh toán khi nhận hàng — bạn sẽ thanh toán khi đơn hàng được giao.
            </Text>
          </VStack>
        </Card>
      </VStack>
    </Card>
  );
};

export default CheckoutForm;
