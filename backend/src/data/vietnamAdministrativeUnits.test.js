const assert = require('node:assert/strict');
const { test } = require('node:test');
const data = require('./vietnamAdministrativeUnits.json');

const provinceNamePrefixByType = new Map([
  ['thành phố trung ương', 'Thành phố '],
  ['tỉnh', 'Tỉnh '],
]);
const wardNamePrefixByType = new Map([
  ['phường', 'Phường '],
  ['xã', 'Xã '],
  ['đặc khu', 'Đặc khu '],
]);
const byProvinceCode = new Map(data.provinces.map((province) => [province.code, province]));
const byWardCode = new Map(data.wards.map((ward) => [ward.code, ward]));

test('contains unique official codes, canonical full names, and valid province parents', () => {
  assert.equal(data.provinces.length, 34);
  assert.equal(data.wards.length, 3321);
  assert.equal(byProvinceCode.size, data.provinces.length);
  assert.equal(byWardCode.size, data.wards.length);

  data.provinces.forEach((province) => {
    assert.match(province.code, /^\d{2}$/);
    assert.ok(provinceNamePrefixByType.has(province.type), `${province.code} has a supported province type`);
    const expectedPrefix = provinceNamePrefixByType.get(province.type);
    assert.ok(
      province.name.toLowerCase().startsWith(expectedPrefix.toLowerCase()),
      `${province.code} has the full-name prefix for its province type`,
    );
  });

  data.wards.forEach((ward) => {
    assert.match(ward.code, /^\d{5}$/);
    assert.ok(wardNamePrefixByType.has(ward.type), `${ward.code} has a supported ward type`);
    const expectedPrefix = wardNamePrefixByType.get(ward.type);
    assert.ok(
      ward.name.toLowerCase().startsWith(expectedPrefix.toLowerCase()),
      `${ward.code} has the full-name prefix for its ward type`,
    );
    assert.ok(byProvinceCode.has(ward.provinceCode), `${ward.code} has a known province parent`);
  });
});

test('uses canonical full names and Vietnamese unit classifications', () => {
  [
    ['01', 'Thành phố Hà Nội', 'thành phố trung ương'],
    ['04', 'Tỉnh Cao Bằng', 'tỉnh'],
    ['22', 'Thành phố Quảng Ninh', 'thành phố trung ương'],
    ['24', 'Thành phố Bắc Ninh', 'thành phố trung ương'],
  ].forEach(([code, name, type]) => {
    assert.deepEqual(byProvinceCode.get(code), { code, name, type });
  });

  [
    ['00004', '01', 'Phường Ba Đình', 'phường'],
    ['00376', '01', 'Xã Sóc Sơn', 'xã'],
    ['06994', '22', 'Đặc khu Vân Đồn', 'đặc khu'],
    ['07192', '22', 'Đặc khu Cô Tô', 'đặc khu'],
    ['11948', '31', 'Đặc khu Bạch Long Vĩ', 'đặc khu'],
    ['20333', '48', 'Đặc khu Hoàng Sa', 'đặc khu'],
  ].forEach(([code, provinceCode, name, type]) => {
    assert.deepEqual(byWardCode.get(code), { code, provinceCode, name, type });
  });

  assert.equal(data.provinces.filter((province) => province.type === 'thành phố trung ương').length, 9);
  assert.equal(data.provinces.filter((province) => province.type === 'tỉnh').length, 25);
  assert.equal(data.wards.filter((ward) => ward.type === 'phường').length, 709);
  assert.equal(data.wards.filter((ward) => ward.type === 'xã').length, 2599);
  assert.equal(data.wards.filter((ward) => ward.type === 'đặc khu').length, 13);
});

test('includes the 12 Bắc Ninh ward reclassifications in resolution 388/NQ-UBTVQH16', () => {
  [
    ['07294', 'Phường Bố Hạ'],
    ['07375', 'Phường Lạng Giang'],
    ['07399', 'Phường Kép'],
    ['07444', 'Phường Lục Nam'],
    ['07840', 'Phường Hiệp Hoà'],
    ['09193', 'Phường Yên Phong'],
    ['09292', 'Phường Phù Lãng'],
    ['09313', 'Phường Chi Lăng'],
    ['09319', 'Phường Tiên Du'],
    ['09454', 'Phường Gia Bình'],
    ['09475', 'Phường Nhân Thắng'],
    ['09496', 'Phường Lương Tài'],
  ].forEach(([code, name]) => {
    assert.deepEqual(byWardCode.get(code), { code, provinceCode: '24', name, type: 'phường' });
  });
});



