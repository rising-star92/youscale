var url = window.location.href;
var protocol = window.location.protocol;
var baseUrl = protocol + "//" + url.split("/")[2];

const urls = {
  prod: baseUrl === "https://app.youscale.co" ? "https://api.youscale.co" : "https://staging-api.youscale.co",
  dev: "https://api.oumardev.com", 
  local: "http://127.0.0.1:8500",
};
export const BASE_URL = urls.local;

/** Auth URL */
export const CLIENT_LOGIN_URL = `${BASE_URL}/api/youscale/v1/client/login`;
export const CLIENT_REGISTER_URL = `${BASE_URL}/api/youscale/v1/client/register`;
export const CLIENT_OTP_URL = `${BASE_URL}/api/youscale/v1/client/verifyOTP`;
export const RESEND_OTP_URL = `${BASE_URL}/api/youscale/v1/client/resend/code`;
export const ADMIN_LOGIN_URL = `${BASE_URL}/api/youscale/v1/admin/login`;
export const ADMIN_REGISTER_URL = `${BASE_URL}/api/youscale/v1/admin/login`;
export const ADMIN_LOGIN_AS_CLIENT_URL = `${BASE_URL}/api/youscale/v1/admin/loginas/client`;
export const ADMIN_TEAM_LOGIN_URL = `${BASE_URL}/api/youscale/v1/team/admin/login`;
export const CLIENT_TEAM_LOGIN_URL = `${BASE_URL}/api/youscale/v1/team/user/login`;
export const CLIENT_PASSWORD_URL = `${BASE_URL}/api/youscale/v1/client/password`;
export const CLIENT_FORGET_PASSWORD_URL = `${BASE_URL}/api/youscale/v1/client/password/forgot`;

/**Client URL */
export const CLIENT_URL = `${BASE_URL}/api/youscale/v1/client`;
export const CLIENT_PRODUIT_URL = `${BASE_URL}/api/youscale/v1/client/product`;
export const CLIENT_CITY_URL = `${BASE_URL}/api/youscale/v1/client/city`;
export const CLIENT_STOCK_URL = `${BASE_URL}/api/youscale/v1/client/stock`;
export const CLIENT_COLUMN_URL = `${BASE_URL}/api/youscale/v1/client/columnoforder`;
export const CLIENT_PAGE_URL = `${BASE_URL}/api/youscale/v1/client/page`;
export const CLIENT_TEAMMEMBER_URL = `${BASE_URL}/api/youscale/v1/client/team_member`;
export const CLIENT_GAINCATEGORIE_URL = `${BASE_URL}/api/youscale/v1/client/gaincategorie`;
export const CLIENT_PERTECATEGORIE_URL = `${BASE_URL}/api/youscale/v1/client/pertecategorie`;
export const CLIENT_GAIN_URL = `${BASE_URL}/api/youscale/v1/client/gain`;
export const CLIENT_PERTE_URL = `${BASE_URL}/api/youscale/v1/client/perte`;
export const CLIENT_TRANSACTION_URL = `${BASE_URL}/api/youscale/v1/client/transaction`;
export const CLIENT_DETAILSOFSPENDING_URL = `${BASE_URL}/api/youscale/v1/client/detailsofspending`;
export const CLIENT_STATUS_URL = `${BASE_URL}/api/youscale/v1/client/status`;
export const CLIENT_SETTING_URL = `${BASE_URL}/api/youscale/v1/client/setting`;
export const CLIENT_ADS_URL = `${BASE_URL}/api/youscale/v1/client/ads`;
export const CLIENT_ANNOUCEMENT_URL = `${BASE_URL}/api/youscale/v1/client/annoucement`;
export const CLIENT_ORDER_URL = `${BASE_URL}/api/youscale/v1/client/order`;
export const CLIENT_PACK_URL = `${BASE_URL}/api/youscale/v1/client/pack`;
export const CLIENT_SUBSCRIPTION_URL = `${BASE_URL}/api/youscale/v1/client/subscription`;
export const CLIENT_PAYMENTMETHOD_URL = `${BASE_URL}/api/youscale/v1/client/paymentmethod`;
export const CLIENT_ADMINBANK_URL = `${BASE_URL}/api/youscale/v1/client/adminbankinformation`;
export const CLIENT_COUPON_URL = `${BASE_URL}/api/youscale/v1/client/coupon`;
export const CLIENT_ACCOUNT_URL = `${BASE_URL}/api/youscale/v1/client/account`;
export const CLIENT_MAKEREFOUND_URL = `${BASE_URL}/api/youscale/v1/client/makerefound`;
export const CLIENT_LASTPAYMENT_URL = `${BASE_URL}/api/youscale/v1/client/lasypayment`;
export const CLIENT_DASHBORD_URL = `${BASE_URL}/api/youscale/v1/client/dashboard`;
export const CLIENT_TOGGLETEAMMEBERSTATUS_URL = `${BASE_URL}/api/youscale/v1/client/changeteammemberstatus`;
export const CLIENT_ORDER_NEW_COUNT_URL = `${BASE_URL}/api/youscale/v1/client/order/count`;
export const CLIENT_TEAM_DASHBORD_URL = `${BASE_URL}/api/youscale/v1/client/dashbord/team_member`;
export const CLIENT_VARIANT_URL = `${BASE_URL}/api/youscale/v1/client/variant`;
export const CLIENT_PAIEMENT_DASHBORD_URL = `${BASE_URL}/api/youscale/v1/client/paiement_dashbord`;
export const CLIENT_GOAL_URL = `${BASE_URL}/api/youscale/v1/client/goal`;
export const CLIENT_UPLOAD_CITY_URL = `${BASE_URL}/api/youscale/v1/client/city/upload`;
export const CLIENT_SHEET_INTEGRATION_URL = `${BASE_URL}/api/youscale/v1/client/integratesheet`;
export const CLIENT_SHIPPING_COMPANIE_URL = `${BASE_URL}/api/youscale/v1/client/shippingcompanie`;
export const CLIENT_SUPPORT_URL = `${BASE_URL}/api/youscale/v1/client/support`;

/**Admin URL */
export const ADMIN_GAINCATEGORIE_URL = `${BASE_URL}/api/youscale/v1/admin/gaincategorie`;
export const ADMIN_PERTECATEGORIE_URL = `${BASE_URL}/api/youscale/v1/admin/pertecategorie`;
export const ADMIN_TRANSACTION_URL = `${BASE_URL}/api/youscale/v1/admin/transaction`;
export const ADMIN_DETAILSOFSPENDING_URL = `${BASE_URL}/api/youscale/v1/admin/detailsofspending`;
export const ADMIN_GAIN_URL = `${BASE_URL}/api/youscale/v1/admin/gain`;
export const ADMIN_PERTE_URL = `${BASE_URL}/api/youscale/v1/admin/perte`;
export const ADMIN_CLIENT_URL = `${BASE_URL}/api/youscale/v1/admin/client`;
export const ADMIN_COLUMN_URL = `${BASE_URL}/api/youscale/v1/admin/columnofuser`;
export const ADMIN_PAGE_URL = `${BASE_URL}/api/youscale/v1/admin/page`;
export const ADMIN_TEAMMEMBER_URL = `${BASE_URL}/api/youscale/v1/admin/team_member`;
export const ADMIN_TEAMMEMBERASDAH_URL = `${BASE_URL}/api/youscale/v1/admin/teammemberasdashbord`;
export const ADMIN_CLIENT_AS_DASHBORD_URL = `${BASE_URL}/api/youscale/v1/admin/user_as_dashbord`;
export const ADMIN_PACK_URL = `${BASE_URL}/api/youscale/v1/admin/pack`;
export const ADMIN_PAYMENTMETHOD_URL = `${BASE_URL}/api/youscale/v1/admin/paymentmethod`;
export const ADMIN_BANKINFORMATION_URL = `${BASE_URL}/api/youscale/v1/admin/bankinformation`;
export const ADMIN_SETTING_URL = `${BASE_URL}/api/youscale/v1/admin/setting`;
export const ADMIN_ADS_URL = `${BASE_URL}/api/youscale/v1/admin/ads`;
export const ADMIN_ANNOUCEMENT_URL = `${BASE_URL}/api/youscale/v1/admin/annoucement`;
export const ADMIN_COUPON_URL = `${BASE_URL}/api/youscale/v1/admin/coupon`;
export const ADMIN_STATUS_URL = `${BASE_URL}/api/youscale/v1/admin/status`;
export const ADMIN_PAYMENT_URL = `${BASE_URL}/api/youscale/v1/admin/paymentclient`;
export const ADMIN_RELOADCLIENTACCOUNT_URL = `${BASE_URL}/api/youscale/v1/admin/reloadclientaccount`;

/** Admin Team URL */
export const ADMIN_TEAM_PAGE_URL = `${BASE_URL}/api/youscale/v1/admin-team/pageacces`;
export const ADMIN_TEAM_COLUMN_URL = `${BASE_URL}/api/youscale/v1/admin-team/columnacces`;

/** Client Team URL */
export const CLIENT_TEAM_PAGE_URL = `${BASE_URL}/api/youscale/v1/client-team/pageacces`;
export const CLIENT_TEAM_COLUMN_URL = `${BASE_URL}/api/youscale/v1/client-team/columnacces`;
export const CLIENT_TEAM_PRODUCT_URL = `${BASE_URL}/api/youscale/v1/client-team/productacces`;
export const CLIENT_TEAM_CITY_URL = `${BASE_URL}/api/youscale/v1/client-team/cityacces`;
export const CLIENT_TEAM_ORDER_URL = `${BASE_URL}/api/youscale/v1/client-team/order`;

