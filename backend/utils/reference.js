// backend/utils/reference.js
const db = require("../configuration/connection");
const axios = require("axios");

/**
 * Helper internal: normalize API
 */
function normalizeApiData(rawData) {
  const result = {};
  Object.keys(rawData).forEach((code) => {
    const { header, details } = rawData[code] || {};

    const normalizedHeader = header
      ? {
          id: header.rfhId,
          code: header.referenceCode,
          name: header.referenceName,
          description: header.description,
        }
      : null;

    const normalizedDetails = (details || []).map((d) => ({
      id: d.rfdId,
      key: d.referenceKey,
      value: d.referenceValue,
      type: d.referenceType,
      description: d.description,
    }));

    const asObject = Object.fromEntries(
      normalizedDetails.map((d) => [d.key, d.value])
    );

    result[code] = {
      header: normalizedHeader,
      details: normalizedDetails,
      asObject,
    };
  });

  return result;
}

/**
 * Load reference: DB
 */
async function fetchFromDb(codes = []) {
  if (!codes || codes.length === 0) return {};

  const [headers] = await db.query(
    `SELECT rfh_id, reference_code, reference_name, description
     FROM reference_header
     WHERE reference_code IN (?)`,
    [codes]
  );

  if (!headers || headers.length === 0) return {};

  const rfhIds = headers.map((h) => h.rfh_id);

  const [details] = await db.query(
    `SELECT rfd_id, rfh_id, reference_key, reference_value, reference_type, description
     FROM reference_detail
     WHERE rfh_id IN (?)`,
    [rfhIds]
  );

  const result = {};
  headers.forEach((h) => {
    result[h.reference_code] = {
      header: {
        id: h.rfh_id,
        code: h.reference_code,
        name: h.reference_name,
        description: h.description,
      },
      details: [],
      asObject: {},
    };
  });

  details.forEach((d) => {
    const header = headers.find((h) => h.rfh_id === d.rfh_id);
    if (!header) return;
    const code = header.reference_code;
    const detailObj = {
      id: d.rfd_id,
      key: d.reference_key,
      value: d.reference_value,
      type: d.reference_type,
      description: d.description,
    };
    result[code].details.push(detailObj);
    result[code].asObject[detailObj.key] = detailObj.value;
  });

  return result;
}

/**
 * Load reference: API
 */
async function fetchFromApi(codes = []) {
  if (!codes || codes.length === 0) return {};

  const base = process.env.BASE_URL;
  if (!base) throw new Error("BASE_URL not defined in .env");

  const url = `${base.replace(/\/$/, "")}/api/reference/referenceList`;

  const token = process.env.REFERENCE_TOKEN || null;
  const headers = token
    ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` }
    : {};

  const resp = await axios.post(url, { referenceCode: codes }, { headers });

  if (!resp?.data?.success || !resp?.data?.data) return {};
  return normalizeApiData(resp.data.data);
}

/**
 * Load reference (DB: default, API: other)
 */
async function getReferences(codes = []) {
  try {
    return await fetchFromDb(codes);
  } catch (err) {
    console.warn(
      "getReferences: DB fetch failed, fallback to API",
      err.message
    );
    return await fetchFromApi(codes);
  }
}

/**
 * Config value
 */
async function getConfigValue(code, key) {
  const refs = await getReferences([code]);
  return refs?.[code]?.asObject?.[key] || null;
}

module.exports = {
  getReferences,
  getConfigValue,
};
