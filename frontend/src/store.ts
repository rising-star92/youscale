import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./services/slice/authSlice";
import { ClientProductApi } from "./services/api/ClientApi/ClientProductApi";
import { ClientCityApi } from "./services/api/ClientApi/ClientCityApi";
import { ClientStockApi } from "./services/api/ClientApi/ClientStockApi";
import { ClientColumnApi } from "./services/api/ClientApi/ClientColumnApi";
import { ClientPageApi } from "./services/api/ClientApi/ClientPageApi";
import { ClientTeamMemberApi } from "./services/api/ClientApi/ClientTeamMemberApi";
import { ClientGainCategorieApi } from "./services/api/ClientApi/ClientGainCategorie";
import { ClientPerteCategorieApi } from "./services/api/ClientApi/ClientPerteCategorie";
import { ClientGainApi } from "./services/api/ClientApi/ClientGainApi";
import { ClientPerteApi } from "./services/api/ClientApi/ClientPerteApi";
import { ClientTransactionApi } from "./services/api/ClientApi/ClientTransactionApi";
import { ClientDetailOfSpendingApi } from "./services/api/ClientApi/ClientDetailOfSpendingApi";
import { ClientStatusApi } from "./services/api/ClientApi/ClientStatusApi";
import { ClientSettingApi } from "./services/api/ClientApi/ClientSettingApi";
import { ClientAdsApi } from "./services/api/ClientApi/ClientAdsApi";
import { ClientAnnoucementApi } from "./services/api/ClientApi/ClientAnnoucementApi";
import { ClientOrderApi } from "./services/api/ClientApi/ClientOrderApi";
import { ClientPackApi } from "./services/api/ClientApi/ClientPackApi";
import { ClientSubscriptionApi } from "./services/api/ClientApi/ClientSubscriptionApi";
import { ClientPaymentMethodApi } from "./services/api/ClientApi/ClientPaymentMethodApi"; 
import { ClientBankAdminApi } from "./services/api/ClientApi/ClientBankAdminApi";
import { ClientCouponApi } from "./services/api/ClientApi/ClientCouponApi";
import { ClientAccountApi } from "./services/api/ClientApi/ClientAccountApi";
import { ClientLastPaymentApi } from "./services/api/ClientApi/ClientLastPaymentApi";
import { ClientMakeRefoundApi } from "./services/api/ClientApi/ClientMakeRefoundApi";
import { ClientDashbordApi } from "./services/api/ClientApi/ClientDashbordApi";
import { ClientCountNewOrderApi } from "./services/api/ClientApi/ClientCountNewOrderApi";
import { ClientTeamDashbordApi } from "./services/api/ClientApi/ClientTeamDashbordApi";
import { ClientPasswordApi } from "./services/api/ClientApi/ClientPasswordApi";
import { ClientVariantApi } from "./services/api/ClientApi/ClientVariantApi";
import { ClientPaiementDashbordApi } from "./services/api/ClientApi/ClientPaiementDashbord";
import { ClientGoalApi } from "./services/api/ClientApi/ClientGoalApi";
import { ClientIntegrateSheetApi } from "./services/api/ClientApi/ClientIntegrateSheetApi";
import { ClientApi } from "./services/api/ClientApi/ClientApi";
import { ClientShippingApi } from "./services/api/ClientApi/ClientShippingApi";
import { ClientSupportApi } from "./services/api/ClientApi/ClientSupportApi";

import { AdminDetailOfSpendingApi } from "./services/api/AdminApi/AdminDetailOfSpendingApi";
import { AdminGainApi } from "./services/api/AdminApi/AdminGainApi";
import { AdminPerteApi } from "./services/api/AdminApi/AdminPerteApi";
import { AdminTransactionApi } from "./services/api/AdminApi/AdminTransactionApi";
import { AdminPerteCategorieApi } from "./services/api/AdminApi/AdminPerteCategorie";
import { AdminGainCategorieApi } from "./services/api/AdminApi/AdminGainCategorie";
import { AdminClientApi } from "./services/api/AdminApi/AdminClientApi";
import { AdminColumnApi } from "./services/api/AdminApi/AdminColumnApi";
import { AdminPageApi } from "./services/api/AdminApi/AdminPageApi";
import { AdminTeamMemberApi } from "./services/api/AdminApi/AdminTeamMemberApi";
import { AdminTeamAsDashbordApi } from "./services/api/AdminApi/AdminTeamAsDashbordApi";
import { AdminClientAsDashbordApi } from "./services/api/AdminApi/AdminClientAsDashbordApi";
import { AdminPackApi } from "./services/api/AdminApi/AdminPackApi";
import { AdminPaymentMethodApi } from "./services/api/AdminApi/AdminPaymentMethodApi";
import { AdminBankInformationApi } from "./services/api/AdminApi/AdminBankInformationApi";
import { AdminSettingApi } from "./services/api/AdminApi/AdminSettingApi";
import { AdminAdsApi } from "./services/api/AdminApi/AdminAdsApi";
import { AdminAnnoucementApi } from "./services/api/AdminApi/AdminAnnoucementApi";
import { AdminCouponApi } from "./services/api/AdminApi/AdminCouponApi";
import { AdminStatusApi } from "./services/api/AdminApi/AdminStatusApi";
import { AdminPaymentApi } from "./services/api/AdminApi/AdminPaymentApi";
import { AdminReloadClientAccountApi } from "./services/api/AdminApi/AdminReloadClientAccountApi";

import { AdminTeamColumnApi } from "./services/api/AdminTeamApi/AdminTeamColumnApi";
import { AdminTeamPageApi } from "./services/api/AdminTeamApi/AdminTeamPageApi";

import { ClientTeamCityApi } from "./services/api/ClientTeamApi/ClientTeamCityApi";
import { ClientTeamColumnApi } from "./services/api/ClientTeamApi/ClientTeamColumnApi";
import { ClientTeamOrderApi } from "./services/api/ClientTeamApi/ClientTeamOrderApi";
import { ClientTeamPageApi } from "./services/api/ClientTeamApi/ClientTeamPageApi";
import { ClientTeamProductApi } from "./services/api/ClientTeamApi/ClientTeamProductApi";

export const store = configureStore({
    reducer: {
        auth : authSlice.reducer,
        [ClientProductApi.reducerPath]: ClientProductApi.reducer,
        [ClientCityApi.reducerPath]: ClientCityApi.reducer,
        [ClientStockApi.reducerPath]: ClientStockApi.reducer,
        [ClientColumnApi.reducerPath]: ClientColumnApi.reducer,
        [ClientPageApi.reducerPath]: ClientPageApi.reducer,
        [ClientTeamMemberApi.reducerPath]: ClientTeamMemberApi.reducer,
        [ClientGainCategorieApi.reducerPath]: ClientGainCategorieApi.reducer,
        [ClientPerteCategorieApi.reducerPath]: ClientPerteCategorieApi.reducer,
        [ClientGainApi.reducerPath]: ClientGainApi.reducer,
        [ClientPerteApi.reducerPath]: ClientPerteApi.reducer,
        [ClientTransactionApi.reducerPath]: ClientTransactionApi.reducer,
        [ClientDetailOfSpendingApi.reducerPath]: ClientDetailOfSpendingApi.reducer,
        [ClientStatusApi.reducerPath]: ClientStatusApi.reducer,
        [ClientSettingApi.reducerPath]: ClientSettingApi.reducer,
        [ClientAdsApi.reducerPath]: ClientAdsApi.reducer,
        [ClientAnnoucementApi.reducerPath]: ClientAnnoucementApi.reducer,
        [ClientOrderApi.reducerPath]: ClientOrderApi.reducer,
        [ClientPackApi.reducerPath]: ClientPackApi.reducer,
        [ClientSubscriptionApi.reducerPath]: ClientSubscriptionApi.reducer,
        [ClientPaymentMethodApi.reducerPath]: ClientPaymentMethodApi.reducer,
        [ClientBankAdminApi.reducerPath]: ClientBankAdminApi.reducer,
        [ClientCouponApi.reducerPath]: ClientCouponApi.reducer,
        [ClientAccountApi.reducerPath]: ClientAccountApi.reducer,
        [ClientLastPaymentApi.reducerPath]: ClientLastPaymentApi.reducer,
        [ClientMakeRefoundApi.reducerPath]: ClientMakeRefoundApi.reducer,
        [ClientDashbordApi.reducerPath]: ClientDashbordApi.reducer,
        [ClientCountNewOrderApi.reducerPath]: ClientCountNewOrderApi.reducer,
        [ClientTeamDashbordApi.reducerPath]: ClientTeamDashbordApi.reducer,
        [ClientPasswordApi.reducerPath]: ClientPasswordApi.reducer,
        [ClientVariantApi.reducerPath]: ClientVariantApi.reducer,
        [ClientPaiementDashbordApi.reducerPath]: ClientPaiementDashbordApi.reducer,
        [ClientGoalApi.reducerPath]: ClientGoalApi.reducer,
        [ClientIntegrateSheetApi.reducerPath]: ClientIntegrateSheetApi.reducer,
        [ClientApi.reducerPath]: ClientApi.reducer,
        [ClientShippingApi.reducerPath]: ClientShippingApi.reducer,
        [ClientSupportApi.reducerPath]: ClientSupportApi.reducer,

        [AdminDetailOfSpendingApi.reducerPath]: AdminDetailOfSpendingApi.reducer,
        [AdminGainApi.reducerPath]: AdminGainApi.reducer,
        [AdminPerteApi.reducerPath]: AdminPerteApi.reducer,
        [AdminTransactionApi.reducerPath]: AdminTransactionApi.reducer,
        [AdminPerteCategorieApi.reducerPath]: AdminPerteCategorieApi.reducer,
        [AdminGainCategorieApi.reducerPath]: AdminGainCategorieApi.reducer,
        [AdminClientApi.reducerPath]: AdminClientApi.reducer,
        [AdminColumnApi.reducerPath]: AdminColumnApi.reducer,
        [AdminPageApi.reducerPath]: AdminPageApi.reducer,
        [AdminTeamMemberApi.reducerPath]: AdminTeamMemberApi.reducer,
        [AdminTeamAsDashbordApi.reducerPath]: AdminTeamAsDashbordApi.reducer,
        [AdminClientAsDashbordApi.reducerPath]: AdminClientAsDashbordApi.reducer,
        [AdminPackApi.reducerPath]: AdminPackApi.reducer,
        [AdminPaymentMethodApi.reducerPath]: AdminPaymentMethodApi.reducer,
        [AdminBankInformationApi.reducerPath]: AdminBankInformationApi.reducer,
        [AdminSettingApi.reducerPath]: AdminSettingApi.reducer,
        [AdminAdsApi.reducerPath]: AdminAdsApi.reducer,
        [AdminAnnoucementApi.reducerPath]: AdminAnnoucementApi.reducer,
        [AdminCouponApi.reducerPath]: AdminCouponApi.reducer,
        [AdminStatusApi.reducerPath]: AdminStatusApi.reducer,
        [AdminPaymentApi.reducerPath]: AdminPaymentApi.reducer,
        [AdminReloadClientAccountApi.reducerPath]: AdminReloadClientAccountApi.reducer,

        [AdminTeamColumnApi.reducerPath]: AdminTeamColumnApi.reducer,
        [AdminTeamPageApi.reducerPath]: AdminTeamPageApi.reducer,

        [ClientTeamCityApi.reducerPath]: ClientTeamCityApi.reducer,
        [ClientTeamColumnApi.reducerPath]: ClientTeamColumnApi.reducer,
        [ClientTeamOrderApi.reducerPath]: ClientTeamOrderApi.reducer,
        [ClientTeamPageApi.reducerPath]: ClientTeamPageApi.reducer,
        [ClientTeamProductApi.reducerPath]: ClientTeamProductApi.reducer
    },

    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
        ClientProductApi.middleware,
        ClientCityApi.middleware,
        ClientStockApi.middleware,
        ClientColumnApi.middleware,
        ClientPageApi.middleware,
        ClientTeamMemberApi.middleware,
        ClientGainCategorieApi.middleware,
        ClientPerteCategorieApi.middleware,
        ClientGainApi.middleware,
        ClientPerteApi.middleware,
        ClientTransactionApi.middleware,
        ClientDetailOfSpendingApi.middleware,
        ClientStatusApi.middleware,
        ClientSettingApi.middleware,
        ClientAdsApi.middleware,
        ClientAnnoucementApi.middleware,
        ClientOrderApi.middleware,
        ClientPackApi.middleware,
        ClientSubscriptionApi.middleware,
        ClientPaymentMethodApi.middleware,
        ClientBankAdminApi.middleware,
        ClientCouponApi.middleware,
        ClientAccountApi.middleware,
        ClientLastPaymentApi.middleware,
        ClientMakeRefoundApi.middleware,
        ClientDashbordApi.middleware,
        ClientCountNewOrderApi.middleware,
        ClientTeamDashbordApi.middleware,
        ClientPasswordApi.middleware,
        ClientVariantApi.middleware,
        ClientPaiementDashbordApi.middleware,
        ClientGoalApi.middleware,
        ClientIntegrateSheetApi.middleware,
        ClientApi.middleware,
        ClientShippingApi.middleware,
        ClientSupportApi.middleware,

        AdminDetailOfSpendingApi.middleware,
        AdminGainApi.middleware,
        AdminPerteApi.middleware,
        AdminTransactionApi.middleware,
        AdminPerteCategorieApi.middleware,
        AdminGainCategorieApi.middleware,
        AdminClientApi.middleware,
        AdminColumnApi.middleware,
        AdminPageApi.middleware,
        AdminTeamMemberApi.middleware,
        AdminTeamAsDashbordApi.middleware,
        AdminClientAsDashbordApi.middleware,
        AdminPackApi.middleware,
        AdminPaymentMethodApi.middleware,
        AdminBankInformationApi.middleware,
        AdminSettingApi.middleware,
        AdminAdsApi.middleware,
        AdminAnnoucementApi.middleware,
        AdminCouponApi.middleware,
        AdminStatusApi.middleware,
        AdminPaymentApi.middleware,
        AdminReloadClientAccountApi.middleware,

        AdminTeamColumnApi.middleware,
        AdminTeamPageApi.middleware,

        ClientTeamCityApi.middleware,
        ClientTeamColumnApi.middleware,
        ClientTeamOrderApi.middleware,
        ClientTeamPageApi.middleware,
        ClientTeamProductApi.middleware
    )
})