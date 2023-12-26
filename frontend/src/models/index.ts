export type OptionsType = {
    label: string,
    value: string
}

export interface AdminLoginModel {
    email: string,
    password: string
}

export interface ShippingModel {
    image: string
    id: number
    name: string
    isShow: boolean
    id_admin: number
    createdAt: string
    updatedAt: string
}

export interface OrderOnlyModel{
    id: number
    id_city: number,
    date: string,
    nom: string,
    telephone: string,
    status: string
    prix: string
    adresse: string
    id_team: number
    Product_Orders: ProductOrder[]
    createdAt: Date
    SheetId: string
    reportedDate: string
    isSendLivo: string
    telDuplicate: boolean
}

export interface ShippingCitiesModel {
    id: number
    id_user: number
    id_city: number
    id_shipping: number
    createdAt: string
    updatedAt: string
    City_User: CityUser
}

export interface ErrorModel {
    errors: Error[]
}

export interface Error {
    value: string
    msg: string
    param: string
    location: string
}

export interface Cient {
    id?: number
    fullname?: string
    livoToken?: string
    trialAt?: null
    isTrial?: boolean
    trialPeriod?: 0
    isBeginner?: boolean
}

export interface AdminRegisterModel {
    email: string,
    fullname: string,
    password: string
}

export interface ClientLoginModel {
    email: string,
    password: string
}


export interface ClientOTPModel {
    code: number,
    telephone: string
}

export interface ForgotPwdModel {
    email: string
}

export interface ClientRegisterModel {
    email: string,
    fullname: string,
    telephone: string,
    password: string,
    code_auth?: string
}

export interface AdminModel {
    email: string,
    fullname: string,
    password: string,
    role: string
}

export interface ClientModel {
    id: number,
    reference: string,
    fullname: string,
    picture: string,
    email: string,
    telephone: string,
    password: string,
    role: string
}


export interface ProductModel {
    id?: number,
    name: string,
    price_selling: string,
    price_buying?: string,
    isHidden?: boolean
    price_best_selling?: string,
    variant?: string[]
}

export interface GetProductModel {
    id: number,
    name: string,
    isDeleted: boolean,
    isHidden: boolean
    variant: string[],
    price_selling: number,
    price_buying: number,
    price_best_selling: number,
    Other_Charges: {
        id: number,
        name: string,
        price: number
    }[]
}

export interface CityModel {
    id?: number,
    name: string,
    price: string,
    isFromSheet?: boolean,
    id_shipping?: number | null,
    isDeleted?: boolean,
    City_User?: {
        id: number,
        name: string,
        active: boolean
    }
}

export interface StockModel {
    id?: number,
    quantity: string,
    id_product: string
}

export interface GetStockModel {
    id?: number,
    quantity: number,
    id_product: number,
    id_city: number,
    Product: ProductModel
}

export interface PageAccessModel {
    id: number,
    Client_Page: {
        id: number,
        name: string
    }
}

export interface ColumnAccessModel {
    id: number,
    Column_Of_Order: {
        id: number,
        name: string,
        alias: string,
        isExported: boolean,
        active: boolean
    }
}


interface UserColumnAccessModel {
    id: number,
    Column_Of_User: {
        id: number,
        name: string,
        alias: string,
        isExported: boolean,
        active: boolean
    }
}

export interface ProductAccessModel {
    id: number,
    Product: {
        id: number,
        name: string,
        variant: string[],
        price_selling: number,
        price_buying: number,
        price_best_selling: number
    }
}

export interface CityAccessModel {
    id: number,
    City_User: {
        id: number,
        name: string,
        active: boolean
    }
}

export interface TeamMemberModel {
    name: string,
    email: string,
    livoToken: string,
    password: string,
    day_payment: string,
    can_delete_order: boolean,
    can_edit_order: boolean,
    all_column_access: boolean,
    all_cities_access: boolean,
    all_product_access: boolean,
    all_page_access: boolean,
    salaire: string,
    commission: string,
    upsell: string,
    downsell: string,
    crosssell: string,
    max_order: string,
    column_access: string[];
    cities_access: string[];
    product_access: string[];
    page_access: string[];
}

export interface GetTeamMemberModel {
    id: number,
    name?: string,
    email?: string,
    livoToken?: string,
    password?: string,
    can_delete_order?: boolean,
    can_edit_order?: boolean,
    all_column_access?: boolean,
    all_cities_access?: boolean,
    all_product_access?: boolean,
    all_page_access?: boolean,
    column_access?: string[];
    cities_access?: string[];
    product_access?: string[];
    page_access?: string[];
    day_payment?: string,
    salaire?: string,
    commission?: string,
    upsell?: string,
    downsell?: string,
    crosssell?: string,
    max_order?: string
    active?: boolean,
    isHidden?: boolean,
    Team_Client_Column_Acces?: ColumnAccessModel[],
    Team_Client_City_Acces?: CityAccessModel[],
    Team_Client_Page_Acces?: PageAccessModel[],
    Team_Client_Product_Acces?: ProductAccessModel[],
    createdAt?: Date,
    updatedAt?: Date
}

export interface ColumnModel {
    id?: number,
    name: string,
    alias: string,
    isExported: boolean,
    active: boolean
}

export interface PageModel {
    id: number,
    name: string
}

export interface GainCategorieModel {
    id?: number,
    name: string
}

export interface PerteCategorieModel {
    id?: number,
    name: string
}

export interface GainModel {
    id?: number,
    amount: number,
    date: string,
    note: string,
    Gain_Categorie: GainCategorieModel,
    Product: ProductModel
}

export interface PerteModel {
    id?: number,
    amount: number,
    date: string,
    note: string,
    Perte_Categorie: PerteCategorieModel,
    Product: ProductModel
}

export interface TransactionModel {
    id?: number,
    amount: number,
    dateFrom: string,
    dateTo: string,
    note: string,
    Perte_Categorie?: PerteCategorieModel,
    Gain_Categorie?: GainCategorieModel,
    Product: ProductModel
}

export interface AddGainModel {
    note: string,
    dateFrom: string,
    dateTo: string,
    amount: number,
    id_product: number,
    id_gain_categorie: number
}

export interface AddPerteModel {
    note: string,
    dateFrom: string,
    dateTo: string,
    amount: string,
    id_product: string,
    id_perte_categorie: string
}

export interface DetailsOfSpendingModel {
    categoryName: string
    products: DetailsOfSpendingProduct[]
}

export interface DetailsOfSpendingProduct {
    id: number
    name: string
    variant: string[]
    price_selling: number
    amount: number
}

export interface ColumnOfOrderModel {
    id?: number,
    name: string,
    alias: string,
    isExported: boolean,
    active: boolean
}

export interface ColumnPatchModel {
    id: any,
    active?: boolean,
    alias?: string,
    isExported?: boolean,
}

export interface StatusModel {
    id?: number,
    name: string,
    checked: boolean,
    color: string,
}

export interface countOrderByStatusModel {
    name: string,
    count: number,
    checked: boolean
}

export interface StatusPatchModel {
    id: number,
    checked?: boolean,
    color?: string
}

export interface GetSettingModel {
    id: number,
    default_cof_ricing: number,
    delfaulnpt_del_pricing: number,
    default_time: number,
    trial_period: number,
    automated_msg: string,
    startWrldOrder: string
}

export interface PatchSettingModel {
    id: number,
    default_conf_pricing?: string,
    delfault_del_pricing?: string,
    default_time?: string,
    automated_msg?: string,
    startWrldOrder?: string
}

export interface AdminTransactionModel {
    id?: number,
    amount: number,
    date: string,
    note: string,
    Admin_Perte_Categorie?: PerteCategorieModel,
    Admin_Gain_Categorie?: GainCategorieModel,
    User: ClientModel
}

export interface AddAdminGainModel {
    note: string,
    date: string,
    amount: number,
    id_user: number,
    id_gain_categorie: number
}

export interface AddAdminPerteModel {
    note: string,
    date: string,
    amount: number,
    id_user: number,
    id_perte_categorie: number
}

export interface AdminDetailsOfSpendingModel {
    total_amount: number,
    Admin_Perte_Categorie: PerteCategorieModel,
    User: ClientModel
}

export interface ColumnOfUserModel {
    id?: number,
    name: string,
    active: boolean
}

export interface AdminTeamMemberModel {
    name: string,
    email: string,
    password: string,
    role: string,
    can_del_or_edit_order: boolean,
    all_column_access: boolean,
    all_page_access: boolean,
    day_payment: number,
    salaire: number,
    commission: number,
    upsell: number,
    max_order: number
}

export interface GetAdminTeamMemberModel {
    id: number,
    name: string,
    email: string,
    password: string,
    role: string,
    can_del_or_edit_order: boolean,
    all_column_access: boolean,
    all_client_access: boolean,
    all_page_access: boolean,
    salaire: number,
    commission: number,
    upsell: number,
    max_order: number,
    Team_Admin_Page_Acces: PageAccessModel[],
    Team_Admin_Column_Acces: UserColumnAccessModel[],
    id_team_member_supportTeamAdmin: ClientModel[],
    id_team_member_confirmationTeamAdmin: ClientModel[],
    id_team_member_commercialTeamAdmin: ClientModel[]
}

export interface GetTeamMemberAsDashbordModel {
    team_support: TeamMemberModel[],
    team_confirmation: TeamMemberModel[],
    team_commercial: TeamMemberModel[]
}

export interface AdminClientModel {
    id: number,
    reference: string,
    fullname: string,
    email: string,
    telephone: string,
    password: string,
    role: string,
    id_team_member_commercial: string,
    id_team_member_confirmation: string,
    id_team_member_support: string,
    support: GetAdminTeamMemberModel,
    confirmation: GetAdminTeamMemberModel,
    commercial: GetAdminTeamMemberModel
}

export interface AdminGetClientModel {
    Client_id: number,
    Name: string,
    Telephone: string,
    Pack: string,
    Message: string,
    Last_activity: string,
    Satisfaction: string,
    Payment: string,
    Subscription_time: string,
    Discount: string,
    Date_of_creation: string,
    Total_earning: string,
    Total_months_payed: string,
    Time_left: string,
    Payement_type: string,
    Payement_Method: string,
    Team_member_support: GetAdminTeamMemberModel,
    Team_member_confirmartion: GetAdminTeamMemberModel,
    Team_member_commercial: GetAdminTeamMemberModel
}

export interface ClientAsDashbordModel {
    id: number,
    id_team_member_support?: any,
    id_team_member_confirmation?: any,
    id_team_member_commercial?: any
}

export interface AdminPackModel {
    id: number,
    name: string,
    price_per_month: number,
    item_inclued: string[]
}

export interface AdminPaymentMethodModel {
    id?: number,
    name: string,
    image?: string,
    Bank_Information?: {
        id: number,
        name: string,
        bank: string,
        rib: string
    }
}

export interface AdminBankInformationModel {
    id?: number,
    bank: string,
    rib: string,
    name: string
}

export interface AdminReferenceModel {
    id_user: number,
    amount: number
}

export interface AdminSettingModel {
    id?: number,
    default_conf_pricing: number,
    delfault_del_pricing: number,
    default_time: number,
    trial_period: number,
    automated_msg: string,
    startWrldOrder: string
}

export interface AdminPatchSettingModel {
    id?: number,
    default_conf_pricing?: number,
    delfault_del_pricing?: number,
    default_time?: number,
    trial_period?: number,
    automated_msg?: string
}

export interface AdminAdsModel {
    id?: number,
    image: string,
    clt_categorie: string[],
}

export interface AdminAnnoucementModel {
    id?: number,
    text: string,
    clt_categorie: string[],
}

export interface AdminCouponModel {
    id: number,
    name: string,
    code: string,
    discount: number,
    time: string,
    limit: number,
    used?: number
}

export interface ClientOrderModel {
    id?: number,
    nom: string,
    telephone: string,
    message: string,
    id_city: string,
    prix: string,
    status: string,
    adresse: string,
    source: string,
    updownsell: string,
    changer: string,
    ouvrir: string,
    id_product_array: any[]
}

export interface GetClientOrderModel {
    Order_id: number,
    Date: string,
    Produit: string,
    Nom: string,
    Telephone: string,
    Ville: string,
    Prix: number,
    Status: string,
    Message: any,
    Adresse: string,
    Shipping: string,
    Source: string,
    Agent: string,
    Last_Action: string,
    Quantity: number,
    Variant: string,
    Changer: string,
    Ouvrir: string,
    'Up/Downsell': string,
    createdAt?: Date,
    updatedAt?: Date,
    [key: string]: any;
}

export interface PatchClientOrderModel {
    id?: number,
    id_city?: number,
    id_team?: number,
    prev_id_team?: number,
    status?: string,
    id_product_array?: any[],
    date?: Date,
    nom?: string,
    telephone?: string,
    prix?: string,
    adresse?: string,
    shipping?: string,
    source?: string,
    last_action?: string,
    quantity?: number,
    variant?: string,
    updownsell?: string,
    message?: string,
    changer?: string
    ouvrir?: string
}

export interface Pack {
    id: number,
    name: string
    support: string,
    isShow: boolean
    price_per_month: number,
    item_inclued: string[],
    createdAt: Date,
    updatedAt: Date
}

export interface Subscription {
    id: number,
    id_pack: number,
    id_user: number,
    date_subscription: Date,
    date_expiration: Date,
    createdAt: Date,
    updatedAt: Date
}

export interface ClientGetPackModel {
    Pack: Pack[],
    Subscription: Subscription,
}

export interface ChangeSubscriptionModel {
    id: number,
    id_pack: number
}

export interface useCouponModel {
    code: string
}

export interface ClientAccountModel {
    id: number,
    solde: number,
    montant_du: number
}

export interface ClientLastPaymentModel {
    id: number,
    image: string,
    amount: number,
    status: string
}

export interface ClientMakeRefundModel {
    amount: number,
    image: string
}

export interface UserPaymentModel {
    id: number;
    reference: string;
    fullname: string;
    role: string;
    email: string;
    telephone: string;
    password: string;
    id_admin: number;
    createdAt: Date;
    updatedAt: Date;
    Subscriptions: {
        id: number;
        id_pack: number;
        id_user: number;
        date_subscription: Date;
        date_expiration: Date;
        createdAt: Date;
        updatedAt: Date;
        Pack: {
            id: number;
            name: string;
            price_per_month: number;
            item_inclued: string[];
            createdAt: Date;
            updatedAt: Date;
        }
    }[]
}

export interface PaymentModel {
    image: string;
    id: number;
    amount: number;
    status: string;
    id_user: number;
    createdAt: Date;
    updatedAt: Date;
    User: UserPaymentModel;
}

export interface DashbordQueryModel {
    datefrom?: string;
    dateto?: string;
    usedate: number;
    id_product_array?: string;
    id_team?: number;
}

export interface TeamDashbordQueryModel {
    id_team?: number
    datefrom?: string;
    dateto?: string;
    usedate: number;
}

export interface BestSellingProduct {
    name: string;
    price: number;
    count: number;
    price_product: number;
}

export interface CityUser {
    id: number;
    name: string;
    price: number;
    id_user: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface BestCity {
    id_city: number;
    count: number;
    City_User: CityUser;
}

export interface Dataset {
    label: string;
    data: number[];
    fill: boolean;
    borderColor: string;
    tension: number;
}

export interface OrderReport {
    labels: string[];
    datasets: Dataset[];
}

export interface CostReport {
    labels: string[];
    datasets: Dataset[];
}

export interface RateReport {
    labels: string[];
    datasets: Dataset[];
}

export interface reportEarningNet {
    labels: string[];
    datasets: Dataset[];
}

export interface orderStatistic {
    data: DataLine
    total: number
}

export interface DataLine {
    labels: string[]
    datasets: Dataset[]
}

export interface DashbordModel {
    costPerLead: number;
    orderInProgress: number;
    upsellRate: number;
    crosssellRate: number;
    stock: number;
    totalOrder: number;
    costPerDelivred: number;
    rateOfConfirmed: number;
    rateOfDelivred: number;
    earningNet: number;
    bestSellingProduct: BestSellingProduct[];
    bestCity: BestCity[];
    orderReport: OrderReport;
    orderStatistic: orderStatistic;
    costReport: CostReport;
    rateReport: RateReport;
    reportEarningNet: reportEarningNet;
}

export interface ProductOrder {
    id: number;
    id_order: number;
    id_product: number;
    variant: string[];
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
    Product: ProductModel;
}

export interface OrderQueryModel {
    status?: string,
    search?: string,
    usedate?: number;
    datefrom?: string;
    dateto?: string;
    id_team?: number;
    _skip?: number;
    _limit?: number;
    id_product_array?: string;
}

export interface CountOrderModel {
    count: number
}

export interface DatasetPerformance {
    label: string;
    data: number[];
    fill: boolean;
    backgroundColor: string[];
}

export interface Performance {
    labels: string[];
    datasets: DatasetPerformance[];
}

export interface DatasetEarning {
    label: string;
    data: number[];
    fill: boolean;
    borderColor: string;
    tension: number;
}

export interface Earning {
    labels: string[];
    datasets: DatasetEarning[];
}

export interface UpDownCrossSell {
    nb_commande: number;
    her_earning: number;
    salaire: number;
}

export interface EarningTable {
    livre: UpDownCrossSell;
    upsell: UpDownCrossSell;
    downsell: UpDownCrossSell;
    crosssell: UpDownCrossSell;
}

export interface TeamDashbordModel {
    performance: Performance;
    performance_rate: Performance;
    earning: Earning;
    earning_table: EarningTable;
}

export interface ResetPasswordModel {
    prevPassword: string;
    newPassword: string;
}

export interface VariantModel {
    id?: number;
    name: string;
}

export interface DashbordPaiementModel {
    ChffAffaire: number;
    spending: number;
    spending_ads: number;
    spending_product: number;
    spending_city: number;
    spending_commission: number;
    spending_landing_design: number;
    spending_autre: number;
    earningNet: number;
    transaction: TransactionModel[];
    detailOfSpending: DetailsOfSpendingModel[];
}

export interface GoalValue {
    id: number;
    value: number;
    id_user: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface GoalModel {
    goalValue: GoalValue;
    goalPercent: number;
}

export interface addGoalModel {
    value: number;
}

export interface SheetIntegrationModel {
    id?: number
    spreadsheetId: string;
    range: string
    name: string;
}

export interface GetSheetIntegrationModel {
    id?: number;
    SheetID: string;
    range_: string;
    name: string;
}

export interface Support {
    id?: number
    subject: string
    description: string
    attachment: any
    status?: string
    id_user?: number
    id_team?: number
    createdAt?: string
}

export interface ChatMessage {
    id?: number
    message: string
    id_support?: number
    id_user?: number
    createdAt?: string
}