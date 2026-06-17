import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutDashboard, ShoppingCart, CheckSquare, Package, Users, Settings as SettingsIcon,
  LogOut, Search, Plus, Minus, Trash2, Bell, ChevronDown, FileText, Check, X,
  Clock, Truck, Inbox, ExternalLink, RefreshCw, Eye, EyeOff, Mail, Menu, Building2,
} from "lucide-react";

/* =========================================================================
   PROCUREMENT PLATFORM — unified app, three switchable design systems
   Live backend: n8n webhooks · Local fallback: localStorage
   ========================================================================= */
const N8N = "https://stefan90.app.n8n.cloud/webhook";
const EP = {
  catalog: `${N8N}/catalog-feed`, orders: `${N8N}/orders-feed`,
  intake: `${N8N}/order-intake`, decision: `${N8N}/order-decision`, auth: `${N8N}/auth`,
};
const ROLES = ["Admin", "Requester", "GM", "Finance", "Viewer"];

/* Real catalogue embedded from Airtable (49 suppliers, 798 products) — used as
   the offline/initial dataset; the live n8n feed overrides it when reachable. */
const SEED_CATALOG = {"suppliers":[{"name":"Pirtek","code":"PIR","email":"krugerstefan54@gmail.com"},{"name":"AC HONED","code":"ACH","email":"krugerstefan65@gmail.com"},{"name":"ACTUM","code":"ACT","email":"krugerstefan65@gmail.com"},{"name":"ATLAS OIL","code":"ATO","email":"krugerstefan65@gmail.com"},{"name":"BEND-A-TUBE","code":"BEN","email":"krugerstefan65@gmail.com"},{"name":"BMG","code":"BMG","email":"krugerstefan65@gmail.com"},{"name":"BRENO","code":"BRE","email":"krugerstefan65@gmail.com"},{"name":"DUROTEC","code":"DUR","email":"krugerstefan65@gmail.com"},{"name":"EASSON-VERTEX","code":"EAS","email":"krugerstefan65@gmail.com"},{"name":"ELECTRAHERTZ","code":"ELE","email":"krugerstefan65@gmail.com"},{"name":"EPS","code":"EPS","email":"krugerstefan65@gmail.com"},{"name":"EWN&S","code":"EWN","email":"krugerstefan65@gmail.com"},{"name":"GASKET MAN","code":"GAM","email":"krugerstefan65@gmail.com"},{"name":"GASKET MAN CC","code":"GMC","email":"krugerstefan65@gmail.com"},{"name":"GAUTENG ARMATURE WINDERS","code":"GAW","email":"krugerstefan65@gmail.com"},{"name":"HST","code":"HST","email":"krugerstefan65@gmail.com"},{"name":"HVB BEARING","code":"HVB","email":"krugerstefan65@gmail.com"},{"name":"HYDROMOBILE","code":"HYD","email":"krugerstefan65@gmail.com"},{"name":"HYDROSALES","code":"HY1","email":"krugerstefan65@gmail.com"},{"name":"ISCAR","code":"ISC","email":"krugerstefan65@gmail.com"},{"name":"KARCHER","code":"KAR","email":"krugerstefan65@gmail.com"},{"name":"M AND R POWER COMPONENTS","code":"MAR","email":"krugerstefan65@gmail.com"},{"name":"MEARON","code":"MEA","email":"krugerstefan65@gmail.com"},{"name":"MINING EMPORIUM","code":"MIE","email":"krugerstefan65@gmail.com"},{"name":"MPOWER BEARINGS","code":"MPB","email":"krugerstefan65@gmail.com"},{"name":"MULTI TASK","code":"MUT","email":"krugerstefan65@gmail.com"},{"name":"MULTI TOOL","code":"MU1","email":"krugerstefan65@gmail.com"},{"name":"OHR&LOGISTICS","code":"OHR","email":"krugerstefan65@gmail.com"},{"name":"PARKER STORE","code":"PAS","email":"krugerstefan65@gmail.com"},{"name":"PARTEX","code":"PAR","email":"krugerstefan65@gmail.com"},{"name":"PETROMARK","code":"PET","email":"krugerstefan65@gmail.com"},{"name":"PROTEKTA","code":"PRO","email":"krugerstefan65@gmail.com"},{"name":"PXC","code":"PXC","email":"krugerstefan65@gmail.com"},{"name":"RADEL","code":"RAD","email":"krugerstefan65@gmail.com"},{"name":"RAND BUILDING","code":"RAB","email":"krugerstefan65@gmail.com"},{"name":"ROLYN ENGINEERING","code":"ROE","email":"krugerstefan65@gmail.com"},{"name":"SA GAUGE","code":"SAG","email":"krugerstefan65@gmail.com"},{"name":"SHIM STOCK","code":"SHS","email":"krugerstefan65@gmail.com"},{"name":"SPEC-CAST WEAR PARTS","code":"SWP","email":"krugerstefan65@gmail.com"},{"name":"STEELMATE","code":"STE","email":"krugerstefan65@gmail.com"},{"name":"TAEGUTEC","code":"TAE","email":"krugerstefan65@gmail.com"},{"name":"TECHNOSLIDE","code":"TEC","email":"krugerstefan65@gmail.com"},{"name":"THC","code":"THC","email":"krugerstefan65@gmail.com"},{"name":"TOCO LIFTING","code":"TOL","email":"krugerstefan65@gmail.com"},{"name":"TOOL CENTRE","code":"TOC","email":"krugerstefan65@gmail.com"},{"name":"TRAMAX","code":"TRA","email":"krugerstefan65@gmail.com"},{"name":"TTS","code":"TTS","email":"krugerstefan65@gmail.com"},{"name":"WEBLOR SPRINGS","code":"WES","email":"krugerstefan65@gmail.com"},{"name":"WECO","code":"WEC","email":"krugerstefan65@gmail.com"}],"products":[{"code":"2000-08","description":"CHECK VALVE","price":1030.83,"supplier":"Pirtek"},{"code":"2000-12","description":"CHECK VALVE","price":2205.82,"supplier":"Pirtek"},{"code":"4001-12","description":"MALE TIP (PROBE) AG. INTERCHANGE","price":486.35,"supplier":"Pirtek"},{"code":"4002-12","description":"COUPLING BODY (CARRIER) AG. INTERCHANGE","price":1093.28,"supplier":"Pirtek"},{"code":"420-910","description":"FERRULE - GREASING HOSE 3/16\".","price":36.31,"supplier":"Pirtek"},{"code":"421-910","description":"6MM STANDPIPE STRAIGHT GREASING HOSE","price":38.84,"supplier":"Pirtek"},{"code":"421-955","description":"6MM STANDPIPE 90 DEGREE GREASING HOSE","price":80.58,"supplier":"Pirtek"},{"code":"622-354","description":"HIGH PRESSURE GREASING HOSE 840 BAR 3/16","price":206.94,"supplier":"Pirtek"},{"code":"A-12-16","description":"NIPPLE 3/4 BSPP MALE X 1 BSPT MALE","price":155.73,"supplier":"Pirtek"},{"code":"AAB-12-17","description":"ADAPTOR 3/4 BSPT M X 1.1/16 JIC FEM SW","price":183.86,"supplier":"Pirtek"},{"code":"AAB-16-21","description":"ADAPTOR 1 BSPT M X 1.5/16 JIC FEM SW","price":280.5,"supplier":"Pirtek"},{"code":"AABN-06-12","description":"ADAPTOR 3/8 NPTF M X 3/4 JIC FEM SW","price":108.2,"supplier":"Pirtek"},{"code":"AABN-20-26","description":"ADAPTOR 1.1/4 NPTF M X 1.5/8 JIC FEM SW","price":477.63,"supplier":"Pirtek"},{"code":"AABP-04-07","description":"ADAPTOR 1/4 BSPP M X 7/16 JIC FEM SW","price":24.75,"supplier":"Pirtek"},{"code":"AABP-04-09","description":"ADAPTOR 1/4 BSPP M X 9/16 JIC FEM SW","price":28.13,"supplier":"Pirtek"},{"code":"AABP-06-09","description":"ADAPTOR 3/8 BSPP M X 9/16 JIC FEM SW","price":30.38,"supplier":"Pirtek"},{"code":"AABP-06-12","description":"ADAPTOR 3/8 BSPP M X 3/4 JIC FEM SW","price":36.01,"supplier":"Pirtek"},{"code":"AABP-08-12","description":"ADAPTOR 1/2 BSPP M X 3/4 JIC FEM SW","price":42.76,"supplier":"Pirtek"},{"code":"AABP-12-17","description":"ADAPTOR 3/4 BSPP M X 1.1/16 JIC FEM SW","price":83.83,"supplier":"Pirtek"},{"code":"AABP-16-21","description":"ADAPTOR 1 BSPP M X 1.5/16 JIC FEM SW","price":109.99,"supplier":"Pirtek"},{"code":"AAU-07-07","description":"ADAPTOR 7/16 UNO M X 7/16 JIC FEM SW","price":89.58,"supplier":"Pirtek"},{"code":"AAU-09-09","description":"ADAPTOR 9/16 UNO M X 9/16 JIC FEM SW","price":112.42,"supplier":"Pirtek"},{"code":"ABN-04-07","description":"ADAPTOR 1/4 NPT FEM X 7/16 JIC MALE","price":68.02,"supplier":"Pirtek"},{"code":"ANU-04-09","description":"ADAPTOR 1/4 NPTF FEM X 9/16 UNO MALE","price":100.57,"supplier":"Pirtek"},{"code":"AP-02","description":"PLUG 1/8 BSPP MALE","price":39.14,"supplier":"Pirtek"},{"code":"AP-04","description":"PLUG 1/4 BSPP MALE","price":42.54,"supplier":"Pirtek"},{"code":"AP-06","description":"PLUG 3/8 BSPP MALE","price":15.19,"supplier":"Pirtek"},{"code":"AP-08","description":"PLUG 1/2 BSPP MALE","price":19.41,"supplier":"Pirtek"},{"code":"AP-12","description":"PLUG 3/4 BSPP MALE","price":29.26,"supplier":"Pirtek"},{"code":"AQ-06-04","description":"RED. BUSH 3/8 BSPT MALE X 1/4 BSPT FEM","price":40.98,"supplier":"Pirtek"},{"code":"AQ-08-04","description":"RED. BUSH 1/2 BSPT MALE X 1/4 BSPT FEM","price":59.61,"supplier":"Pirtek"},{"code":"AR-06-04","description":"RED. BUSH 3/8 NPTF MALE X 1/4 NPTF FEM","price":40.98,"supplier":"Pirtek"},{"code":"AR-08-04","description":"RED. BUSH 1/2 NPTF MALE X 1/4 NPTF FEM","price":59.61,"supplier":"Pirtek"},{"code":"AU-07","description":"PLUG 7/16 JIC MALE","price":6.96,"supplier":"Pirtek"},{"code":"AU-09","description":"PLUG 9/16 JIC MALE","price":10.44,"supplier":"Pirtek"},{"code":"AU-12","description":"PLUG 3/4 JIC MALE","price":12.61,"supplier":"Pirtek"},{"code":"AU-17","description":"PLUG 1.1/16 JIC MALE","price":23.05,"supplier":"Pirtek"},{"code":"AV-09","description":"PLUG 9/16 UNO MALE","price":25.49,"supplier":"Pirtek"},{"code":"AVH-05","description":"PLUG 5/16 UNO MALE HOLLOW HEX","price":23.04,"supplier":"Pirtek"},{"code":"AVH-07","description":"PLUG 7/16 UNO MALE HOLLOW HEX","price":33.38,"supplier":"Pirtek"},{"code":"AVH-08","description":"PLUG 1/2 UNO MALE HOLLOW HEX","price":24.68,"supplier":"Pirtek"},{"code":"AVH-09","description":"PLUG 9/16 UNO MALE HOLLOW HEX","price":42.02,"supplier":"Pirtek"},{"code":"AVH-12","description":"PLUG 3/4 UNO MALE HOLLOW HEX","price":65.14,"supplier":"Pirtek"},{"code":"AVH-17","description":"PLUG 1.1/16 UNO MALE HOLLOW HEX","price":97.97,"supplier":"Pirtek"},{"code":"AW-07","description":"CAP 7/16 JIC FEM SW","price":13.05,"supplier":"Pirtek"},{"code":"AW-09","description":"CAP 9/16 JIC FEM SW","price":17.83,"supplier":"Pirtek"},{"code":"AW-12","description":"CAP 3/4 JIC FEM SW","price":20.88,"supplier":"Pirtek"},{"code":"AW-17","description":"CAP 1.1/16 JIC FEM SW","price":33.92,"supplier":"Pirtek"},{"code":"AW-21","description":"CAP 1.5/16 JIC FEM SW","price":207.48,"supplier":"Pirtek"},{"code":"AX-06","description":"CAP 3/8 BSPP FEM SW","price":49.12,"supplier":"Pirtek"},{"code":"AX3-12","description":"FLANGE BLANK (BLIND) 3000PSI C61 (3/4)","price":66.67,"supplier":"Pirtek"},{"code":"AX3-16","description":"FLANGE BLANK (BLIND) 3000PSI C61 (1)","price":79.05,"supplier":"Pirtek"},{"code":"AX3-32","description":"FLANGE BLANK (BLIND) 3000PSI C61 (2)","price":173.56,"supplier":"Pirtek"},{"code":"AZ3-12","description":"FLANGE CLAMPS SPLIT 3000PSI C61 (3/4)","price":145.78,"supplier":"Pirtek"},{"code":"AZ3-16","description":"FLANGE CLAMPS SPLIT 3000PSI C61 (1)","price":171.27,"supplier":"Pirtek"},{"code":"AZ3-24","description":"FLANGE CLAMPS SPLIT 3000PSI C61 (1.1/2)","price":355.62,"supplier":"Pirtek"},{"code":"AZ3-32","description":"FLANGE CLAMPS SPLIT 3000PSI C61 (2)","price":401.32,"supplier":"Pirtek"},{"code":"AZ3-40","description":"FLANGE CLAMPS SPLIT 3000PSI C61 (2.1/2)","price":346.14,"supplier":"Pirtek"},{"code":"AZ6-12","description":"FLANGE CLAMPS SPLIT 6000PSI C62 (3/4)","price":216.16,"supplier":"Pirtek"},{"code":"B-16-16","description":"NIPPLE 1 BSPP MALE B/HD X BSPP MALE","price":411.02,"supplier":"Pirtek"},{"code":"BB-09-07","description":"REDUCER JIC FEM X JIC MALE (ONE PIECE)","price":15.22,"supplier":"Pirtek"},{"code":"BB-12-07","description":"REDUCER JIC FEM X JIC MALE (ONE PIECE)","price":23.05,"supplier":"Pirtek"},{"code":"BB-12-09","description":"REDUCER JIC FEM X JIC MALE (ONE PIECE)","price":23.05,"supplier":"Pirtek"},{"code":"BB-14-07","description":"REDUCER JIC FEM X JIC MALE (ONE PIECE)","price":31.32,"supplier":"Pirtek"},{"code":"BB-14-12","description":"REDUCER JIC FEM X JIC MALE (ONE PIECE)","price":31.32,"supplier":"Pirtek"},{"code":"BB-17-07","description":"REDUCER JIC FEM X JIC MALE (ONE PIECE)","price":82.74,"supplier":"Pirtek"},{"code":"BB-17-09","description":"REDUCER JIC FEM X JIC MALE (ONE PIECE)","price":82.74,"supplier":"Pirtek"},{"code":"BB-17-12","description":"REDUCER JIC FEM X JIC MALE (ONE PIECE)","price":35.23,"supplier":"Pirtek"},{"code":"BB-17-21","description":"REDUCER JIC FEM X JIC MALE (ONE PIECE)","price":71.76,"supplier":"Pirtek"},{"code":"BB-21-12","description":"REDUCER JIC FEM X JIC MALE (ONE PIECE)","price":51.76,"supplier":"Pirtek"},{"code":"BB-21-17","description":"REDUCER JIC FEM X JIC MALE (ONE PIECE)","price":69.59,"supplier":"Pirtek"},{"code":"BB-26-21","description":"REDUCER JIC FEM X JIC MALE (ONE PIECE)","price":245.56,"supplier":"Pirtek"},{"code":"BB-30-21","description":"REDUCER JIC FEM X JIC MALE (ONE PIECE)","price":351.75,"supplier":"Pirtek"},{"code":"BB-30-26","description":"REDUCER JIC FEM X JIC MALE (ONE PIECE)","price":149.18,"supplier":"Pirtek"},{"code":"BF1-0606K","description":"3/8\" BSPP FEM STR 3/8\" HOSE","price":141.14,"supplier":"Pirtek"},{"code":"BF1-0806K","description":"1/2\" BSPP FEM STR 3/8\" HOSE","price":188.03,"supplier":"Pirtek"},{"code":"BF1-0808K","description":"1/2\" BSPP FEM STR 1/2\" HOSE","price":194.52,"supplier":"Pirtek"},{"code":"BF1-1010LPT","description":"5/8\" BSPP FEMALE STR 5/8\" BRAIDED HOSE","price":148.91,"supplier":"Pirtek"},{"code":"BF1-1212J","description":"3/4\" BSPP FEM STR 3/4\" HOSE","price":365.24,"supplier":"Pirtek"},{"code":"BF4-1010K","description":"5/8\" BSPP FEM 45 DEG 5/8\" HOSE","price":476.32,"supplier":"Pirtek"},{"code":"BF4-1212J","description":"3/4\" BSPP FEM 45 DEG 3/4\" HOSE","price":657.84,"supplier":"Pirtek"},{"code":"BF9-0606K","description":"3/8\" BSPP FEM 90 DEG 3/8\" HOSE","price":249.92,"supplier":"Pirtek"},{"code":"BF9-0806K","description":"1/2\" BSPP FEM 90 DEG 3/8\" HOSE","price":371.81,"supplier":"Pirtek"},{"code":"BF9-0808K","description":"1/2\" BSPP FEM 90 DEG 1/2\" HOSE","price":316.34,"supplier":"Pirtek"},{"code":"BF9-1010K","description":"5/8\" BSPP FEM 90 DEG 5/8\" HOSE","price":478.35,"supplier":"Pirtek"},{"code":"BFH-12","description":"FLANGE BLOCK 3/4 C62 X 3/4 BSPP FEM","price":186.78,"supplier":"Pirtek"},{"code":"BFH-16","description":"FLANGE BLOCK 1 C62 X 1 BSPP FEM","price":273.42,"supplier":"Pirtek"},{"code":"BFS-12","description":"FLANGE BLOCK 3/4 C61 X 3/4 BSPP FEM","price":508.98,"supplier":"Pirtek"},{"code":"BFS-16","description":"FLANGE BLOCK 1 C61 X 1 BSPP FEM","price":459.62,"supplier":"Pirtek"},{"code":"BFS-20","description":"FLANGE BLOCK 1.1/4 C61 X 1.1/4 BSPP FEM","price":898.97,"supplier":"Pirtek"},{"code":"BFS-24","description":"FLANGE BLOCK 1.1/2 C61 X 1.1/2 BSPP FEM","price":1354.69,"supplier":"Pirtek"},{"code":"BFS-32","description":"FLANGE BLOCK 2 C61 X 2 BSPP FEM","price":1426.35,"supplier":"Pirtek"},{"code":"BM1-1406K","description":"14MM METRIC BANJO STR 3/8\" HOSE","price":88.97,"supplier":"Pirtek"},{"code":"BMB-30","description":"BANJO METRIC BOLT","price":165.67,"supplier":"Pirtek"},{"code":"BTM1-0806K","description":"1/2\" BSPT MALE STR 3/8\" HOSE","price":252.22,"supplier":"Pirtek"},{"code":"C-02-07","description":"NIPPLE 1/8 BSPP MALE X 7/16 JIC MALE","price":33.38,"supplier":"Pirtek"},{"code":"C-02-09","description":"NIPPLE 1/8 BSPP MALE X 9/16 JIC MALE","price":39.14,"supplier":"Pirtek"},{"code":"C-04-07","description":"NIPPLE 1/4 BSPP MALE X 7/16 JIC MALE","price":15.66,"supplier":"Pirtek"},{"code":"C-04-09","description":"NIPPLE 1/4 BSPP MALE X 9/16 JIC MALE","price":17.4,"supplier":"Pirtek"},{"code":"C-06-07","description":"NIPPLE 3/8 BSPP MALE X 7/16 JIC MALE","price":19.14,"supplier":"Pirtek"},{"code":"C-06-09","description":"NIPPLE 3/8 BSPP MALE X 9/16 JIC MALE","price":19.14,"supplier":"Pirtek"},{"code":"C-06-12","description":"NIPPLE 3/8 BSPP MALE X 3/4 JIC MALE","price":19.57,"supplier":"Pirtek"},{"code":"C-08-09","description":"NIPPLE 1/2 BSPP MALE X 9/16 JIC MALE","price":28.71,"supplier":"Pirtek"},{"code":"C-08-12","description":"NIPPLE 1/2 BSPP MALE X 3/4 JIC MALE","price":30.01,"supplier":"Pirtek"},{"code":"C-08-17","description":"NIPPLE 1/2 BSPP MALE X 1.1/16 JIC MALE","price":35.23,"supplier":"Pirtek"},{"code":"C-12-09","description":"NIPPLE 3/4 BSPP MALE X 9/16 JIC MALE","price":111.09,"supplier":"Pirtek"},{"code":"C-12-12","description":"NIPPLE 3/4 BSPP MALE X 3/4 JIC MALE","price":36.97,"supplier":"Pirtek"},{"code":"C-12-14","description":"NIPPLE 3/4 BSPP MALE X 7/8 JIC MALE","price":116.87,"supplier":"Pirtek"},{"code":"C-12-17","description":"NIPPLE 3/4 BSPP MALE X 1.1/16 JIC MALE","price":37.84,"supplier":"Pirtek"},{"code":"C-12-21","description":"NIPPLE 3/4 BSPP MALE X 1.5/16 JIC MALE","price":49.58,"supplier":"Pirtek"},{"code":"C-16-12","description":"NIPPLE 1 BSPP MALE X 3/4 JIC MALE","price":209.56,"supplier":"Pirtek"},{"code":"C-16-17","description":"NIPPLE 1 BSPP MALE X 1.1/16 JIC MALE","price":66.98,"supplier":"Pirtek"},{"code":"C-16-21","description":"NIPPLE 1 BSPP MALE X 1.5/16 JIC MALE","price":69.15,"supplier":"Pirtek"},{"code":"C-20-21","description":"NIPPLE 1.1/4 BSPP MALE X 1.5/16 JIC MALE","price":479.83,"supplier":"Pirtek"},{"code":"C-20-26","description":"NIPPLE 1.1/4 BSPP MALE X 1.5/8 JIC MALE","price":489.27,"supplier":"Pirtek"},{"code":"C-20-30","description":"NIPPLE 1.1/4 BSPP MALE X 1.7/8 JIC MALE","price":158.75,"supplier":"Pirtek"},{"code":"C-24-26","description":"NIPPLE 1.1/2 BSPP MALE X 1.5/8 JIC MALE","price":609.57,"supplier":"Pirtek"},{"code":"C35-08","description":"HYDRAULIC HOSE 350 BAR 1/2\".","price":133.56,"supplier":"Pirtek"},{"code":"C611-1212J","description":"3/4\" SAE CODE 61 STR 3/4\" HOSE","price":811.76,"supplier":"Pirtek"},{"code":"C611-2420J","description":"1 1/2\" SAE CODE 61 STR 1 1/4\" HOSE","price":1898.48,"supplier":"Pirtek"},{"code":"C619-1212J","description":"3/4\" SAE CODE 61 90 DEG 3/4\" HOSE","price":1069.96,"supplier":"Pirtek"},{"code":"C619-1616J","description":"1\" SAE CODE 61 90 DEG 1\" HOSE","price":420.41,"supplier":"Pirtek"},{"code":"C619-2420J","description":"1 1/2\" SAE CODE 61 90 DEG 1 1/4\" HOSE","price":3425.47,"supplier":"Pirtek"},{"code":"C619-2424J","description":"1 1/2\" SAE CODE 61 90 DEG 1 1/2\" HOSE","price":3459.56,"supplier":"Pirtek"},{"code":"C621-1212J","description":"3/4\" SAE CODE 62 STR 3/4\" HOSE","price":896.98,"supplier":"Pirtek"},{"code":"C621JM-1217","description":"STRAIGHT FLANGE ADAPTOR CODE 62 X JIC MA","price":373.84,"supplier":"Pirtek"},{"code":"C624-1212J","description":"3/4\" SAE CODE 62 45 DEG 3/4\" HOSE","price":1140.41,"supplier":"Pirtek"},{"code":"C629-1212J","description":"3/4\" SAE CODE 62 90 DEG 3/4\" HOSE","price":438.01,"supplier":"Pirtek"},{"code":"C629JM-1617","description":"90' FLANGE ADAPTOR CODE 62 X JIC MALE","price":599.34,"supplier":"Pirtek"},{"code":"CAA-17-17","description":"ELB 90 1.1/16 JIC MALE X 1.1/16 JIC MALE","price":244.25,"supplier":"Pirtek"},{"code":"CAB-07-07","description":"ELB 90 7/16 JIC M X 7/16 JIC FEM SW","price":37.84,"supplier":"Pirtek"},{"code":"CAB-09-09","description":"ELB 90 9/16 JIC M X 9/16 JIC FEM SW","price":50.89,"supplier":"Pirtek"},{"code":"CAB-12-12","description":"ELB 90 3/4 JIC M X 3/4 JIC FEM SW","price":61.76,"supplier":"Pirtek"},{"code":"CAB-17-17","description":"ELB 90 1.1/16 JIC M X 1.1/16 JIC FEM SW","price":107.43,"supplier":"Pirtek"},{"code":"CBA-17-17-17","description":"TEE 1.1/16 JIC M X JIC M X JIC M","price":314.88,"supplier":"Pirtek"},{"code":"CBB-09-09-09","description":"TEE 9/16 JIC MALE X JIC M X JIC FEM SW","price":190.93,"supplier":"Pirtek"},{"code":"CBB-30-30-30","description":"TEE 1.7/8 JIC MALE X JIC M X JIC FEM SW","price":2004.4,"supplier":"Pirtek"},{"code":"CBM-08-08-08","description":"TEE JIC MALE X JIC MALE X UNO MALE","price":55.67,"supplier":"Pirtek"},{"code":"CFA-04-07","description":"ELB 90 1/4 BSPP MALE X 7/16 JIC MALE","price":40.88,"supplier":"Pirtek"},{"code":"CFA-04-09","description":"ELB 90 1/4 BSPP MALE X 9/16 JIC MALE","price":41.32,"supplier":"Pirtek"},{"code":"CFA-06-07","description":"ELB 90 3/8 BSPP MALE X 7/16 JIC MALE","price":43.06,"supplier":"Pirtek"},{"code":"CFA-06-09","description":"ELB 90 3/8 BSPP MALE X 9/16 JIC MALE","price":45.23,"supplier":"Pirtek"},{"code":"CFA-20-21","description":"ELB 90 1.1/4 BSPP MALE X 1.5/16 JIC MALE","price":942.87,"supplier":"Pirtek"},{"code":"CFA-20-26","description":"ELB 90 1.1/4 BSPP MALE X 1.5/8 JIC MALE","price":970.66,"supplier":"Pirtek"},{"code":"CFA-24-30","description":"ELB 90 1.1/2 BSPP MALE X 1.7/8 JIC MALE","price":1800.59,"supplier":"Pirtek"},{"code":"CFJ-12-08","description":"ELB 90 3/4 BSPP MALE X 1/2 BSPT MALE","price":300.22,"supplier":"Pirtek"},{"code":"CGB-07-07","description":"ELB 45 7/16 JIC M X 7/16 JIC FEM SW","price":133.71,"supplier":"Pirtek"},{"code":"CGB-09-09","description":"ELB 45 9/16 JIC M X 9/16 JIC FEM SW","price":145.78,"supplier":"Pirtek"},{"code":"CGS-07-07","description":"STRAIGHT JIC MALE X JIC FEMALE","price":71.45,"supplier":"Pirtek"},{"code":"CGS-09-09","description":"STRAIGHT JIC MALE X JIC FEMALE","price":33.49,"supplier":"Pirtek"},{"code":"CGS-12-12","description":"STRAIGHT JIC MALE X JIC FEMALE","price":144.69,"supplier":"Pirtek"},{"code":"CGS-30-30","description":"STRAIGHT JIC MALE X JIC FEMALE","price":807.54,"supplier":"Pirtek"},{"code":"CJAP-04-09","description":"ELBOW 45` BSPP MALE X JIC MALE","price":58.28,"supplier":"Pirtek"},{"code":"CMA-07-07-07","description":"TEE 7/16 JIC MALE X FEM SW X JIC M","price":46.1,"supplier":"Pirtek"},{"code":"CMA-09-09-09","description":"TEE 9/16 JIC MALE X FEM SW X JIC M","price":60.89,"supplier":"Pirtek"},{"code":"CMA-12-12-12","description":"TEE 3/4 JIC MALE X FEM SW X JIC M","price":83.94,"supplier":"Pirtek"},{"code":"CMA-17-17-17","description":"TEE 1.1/16 JIC MALE X FEM SW X JIC M","price":451.97,"supplier":"Pirtek"},{"code":"CMA-21-21-21","description":"TEE 1.5/16 JIC MALE X FEM SW X JIC M","price":248.78,"supplier":"Pirtek"},{"code":"CP4-45C","description":"CP4-45 CLAMP COMPLETE","price":473.47,"supplier":"Pirtek"},{"code":"CP4-48C","description":"CP4-48 CLAMP COMPLETE","price":438.4,"supplier":"Pirtek"},{"code":"CVDP-12-12","description":"ELBOW 90` BSPP MALE X BSPP FEMALE","price":380.38,"supplier":"Pirtek"},{"code":"CX-06-12.070","description":"ADAPTOR 3/8 BSPP MALE X 1/2 JIC MALE EXT","price":427.04,"supplier":"Pirtek"},{"code":"EPF-12-12-12","description":"TEE 3/4 BSPT FEM X BSPT FEM X BSPT FEM","price":434.93,"supplier":"Pirtek"},{"code":"EVGE-12LR3/8ED","description":"12L FEM STUD COUPL MALE 3/8 BSPP ED SEAL","price":78.24,"supplier":"Pirtek"},{"code":"EVGE-12SR3/8ED","description":"12S FEM STUD COUPL MALE 3/8 BSPP ED SEAL","price":104.32,"supplier":"Pirtek"},{"code":"EVL-12S","description":"12S ADJ FEM BARREL TEE COUPL M20X1.5","price":250.66,"supplier":"Pirtek"},{"code":"EVW-12S","description":"12S ADJ FEM 90\u00ba ELBOW COUPL M20X1.5","price":170.25,"supplier":"Pirtek"},{"code":"F-12-12","description":"NIPPLE 3/4 BSPT MALE X 3/4 JIC MALE","price":92.97,"supplier":"Pirtek"},{"code":"F-16-12","description":"NIPPLE 1 BSPT MALE X 3/4 JIC MALE","price":144.47,"supplier":"Pirtek"},{"code":"FF1201-1212","description":"NIPPLE 3/4 BSPP MALE X 1.3/16 ORFS MALE","price":210.63,"supplier":"Pirtek"},{"code":"FF1201-1616","description":"NIPPLE 1 BSPP MALE X 1.7/16 ORFS MALE","price":91.14,"supplier":"Pirtek"},{"code":"FF1201-2016","description":"NIPPLE 1.1/4 BSPP MALE X 1.7/16 ORFS MA","price":326.73,"supplier":"Pirtek"},{"code":"FF1201-2020","description":"NIPPLE 1.1/4 BSPP MALE X 1.11/16 ORFS MA","price":457.23,"supplier":"Pirtek"},{"code":"FF1202-0404","description":"NIPPLE 9/16 ORFS MALE X 1/4 NPTF MALE","price":54.87,"supplier":"Pirtek"},{"code":"FF1202-0406","description":"NIPPLE 9/16 ORFS MALE X 3/8 NPTF MALE","price":67.52,"supplier":"Pirtek"},{"code":"FF1202-0808","description":"NIPPLE 13/16 ORFS MALE X 1/2 NPTF MALE","price":116.63,"supplier":"Pirtek"},{"code":"FF1202-1212","description":"NIPPLE 1.3/16 ORFS MALE X 3/4 NPTF MALE","price":157.31,"supplier":"Pirtek"},{"code":"FF1202-1612","description":"NIPPLE 1.7/16 ORFS MALE X 3/4 NPTF MALE","price":151.56,"supplier":"Pirtek"},{"code":"FF1202-1616","description":"NIPPLE 1.7/16 ORFS MALE X 1 NPTF MALE","price":175.43,"supplier":"Pirtek"},{"code":"FF1204-0404","description":"NIPPLE 9/16 ORFS MALE X 9/16 ORFS MALE","price":57.52,"supplier":"Pirtek"},{"code":"FF1204-0606","description":"NIPPLE 11/16 ORFS MALE X 11/16 ORFS MALE","price":74.62,"supplier":"Pirtek"},{"code":"FF1204-1616","description":"NIPPLE 1.7/16 ORFS MALE X 1.7/16 ORFS MA","price":282.06,"supplier":"Pirtek"},{"code":"FF1205-0404","description":"ADAPTOR 1/4 BSPP M X 9/16 ORFS FEM SW","price":105.47,"supplier":"Pirtek"},{"code":"FF1208-0402","description":"ELB 90 9/16 ORFS MALE X 1/8 NPTF MALE","price":120.54,"supplier":"Pirtek"},{"code":"FF1227-161616","description":"TEE 1.7/16 ORFS M X ORFS M X ORFS FM SW","price":1098.59,"supplier":"Pirtek"},{"code":"FF1231-0406","description":"NIPPLE 9/16 ORFS MALE X 9/16 UNO MALE","price":54.87,"supplier":"Pirtek"},{"code":"FF1231-0605","description":"NIPPLE 11/16 ORFS MALE X 1/2 UNO MALE","price":86.63,"supplier":"Pirtek"},{"code":"FF1231-0606","description":"NIPPLE 11/16 ORFS MALE X 9/16 UNO MALE","price":63.03,"supplier":"Pirtek"},{"code":"FF1231-0806","description":"NIPPLE 13/16 ORFS MALE X 9/16 UNO MALE","price":82.74,"supplier":"Pirtek"},{"code":"FF1231-0808","description":"NIPPLE 13/16 ORFS MALE X 3/4 UNO MALE","price":84.35,"supplier":"Pirtek"},{"code":"FF1231-1008","description":"NIPPLE 1 ORFS MALE X 3/4 UNO MALE","price":108.2,"supplier":"Pirtek"},{"code":"FF1231-1212","description":"NIPPLE 1.3/16 ORFS MALE X 1.1/16 UNO MAL","price":178.34,"supplier":"Pirtek"},{"code":"FF1231-2020","description":"NIPPLE 1.11/16 ORFS MALE X 1.5/8 UNO MAL","price":387.38,"supplier":"Pirtek"},{"code":"FF1236-0404","description":"ELB 90 9/16 ORFS M X 9/16 ORFS FEM","price":172.29,"supplier":"Pirtek"},{"code":"FF1236-0606","description":"ELB 90 11/16 ORFS M X 11/16 ORFS FEM","price":207.48,"supplier":"Pirtek"},{"code":"FF1236-1010","description":"ELB 90 1 ORFS M X 1 ORFS FEM","price":297.54,"supplier":"Pirtek"},{"code":"FF1236-1212","description":"ELB 90 1.3/16 ORFS M X 1.3/16 ORFS FEM","price":430.71,"supplier":"Pirtek"},{"code":"FF1238-1212","description":"ELB 90 1.3/16 ORFS MALE X 1.1/16 UNO MAL","price":176.15,"supplier":"Pirtek"},{"code":"FF1248-040404","description":"TEE 9/16 ORFS M X ORFS FEM SW X ORFS M","price":69.15,"supplier":"Pirtek"},{"code":"FF1248-060606","description":"TEE 11/16 ORFS M X ORFS FEM SW X ORFS M","price":87.42,"supplier":"Pirtek"},{"code":"FF1248-080808","description":"TEE 13/16 ORFS M X ORFS FEM SW X ORFS M","price":113.52,"supplier":"Pirtek"},{"code":"FF1248-101010","description":"TEE 1 ORFS M X ORFS FEM SW X ORFS M","price":448.56,"supplier":"Pirtek"},{"code":"FF1248-121212","description":"TEE 1.3/16 ORFS M X ORFS FEM SW X ORFS M","price":731.68,"supplier":"Pirtek"},{"code":"FF1248-161616","description":"TEE 1.7/16 ORFS M X ORFS FEM SW X ORFS M","price":1098.59,"supplier":"Pirtek"},{"code":"FF1254-04","description":"PLUG 9/16 ORFS","price":36.51,"supplier":"Pirtek"},{"code":"FF1254-06","description":"PLUG 11/16 ORFS","price":46.49,"supplier":"Pirtek"},{"code":"FF1254-08","description":"PLUG 13/16 ORFS","price":63.03,"supplier":"Pirtek"},{"code":"FF1254-10","description":"PLUG 1 ORFS","price":88.52,"supplier":"Pirtek"},{"code":"FF1254-12","description":"PLUG 1.3/16 ORFS","price":106.92,"supplier":"Pirtek"},{"code":"FF1254-16","description":"PLUG 1.7/16 ORFS","price":172.56,"supplier":"Pirtek"},{"code":"FF1254-20","description":"PLUG 1.11/16 ORFS","price":238.48,"supplier":"Pirtek"},{"code":"FF1260LN-1010","description":"NIPPLE 1 ORFS MALE X ORFS MALE B/HD","price":292.86,"supplier":"Pirtek"},{"code":"FF1265-060606","description":"TEE 11/16 ORFS MALE X ORFS M X 9/16 UNO","price":276.03,"supplier":"Pirtek"},{"code":"FF1266-161616","description":"TEE 1.5/16 UNO M X 1.7/16 ORFS M X ORFS","price":1079.94,"supplier":"Pirtek"},{"code":"FF1291-0204","description":"ELB 90 1/8 BSPP MALE X 9/16 ORFS MALE","price":185.63,"supplier":"Pirtek"},{"code":"FF1291-0404","description":"ELB 90 1/4 BSPP MALE X 9/16 ORFS MALE","price":223.94,"supplier":"Pirtek"},{"code":"FF1311-04","description":"TUBE NUT ORFS","price":21.01,"supplier":"Pirtek"},{"code":"FF1311-06","description":"TUBE NUT ORFS","price":28.09,"supplier":"Pirtek"},{"code":"FF1311-08","description":"TUBE NUT 13/16 ORFS","price":36.25,"supplier":"Pirtek"},{"code":"FF1311-10","description":"TUBE NUT ORFS","price":46.24,"supplier":"Pirtek"},{"code":"FF1311-12","description":"TUBE NUT ORFS","price":101.65,"supplier":"Pirtek"},{"code":"FF1319-04","description":"CAP 9/16 ORFS FEM + INSERT COMPLETE","price":40.72,"supplier":"Pirtek"},{"code":"FF1319-06","description":"CAP 11/16 ORFS FEM + INSERT COMPLETE","price":52.0,"supplier":"Pirtek"},{"code":"FF1319-08","description":"CAP 13/16 ORFS FEM + INSERT COMPLETE","price":70.12,"supplier":"Pirtek"},{"code":"FF1319-12","description":"CAP 1.3/16 ORFS FEM + INSERT COMPLETE","price":140.52,"supplier":"Pirtek"},{"code":"FF1319-16","description":"CAP 1.7/16 ORFS FEM + INSERT COMPLETE","price":178.34,"supplier":"Pirtek"},{"code":"FF3018-0810","description":"REDUCER ORFS MALE X ORFS FEMALE INSERT","price":224.55,"supplier":"Pirtek"},{"code":"GE-06LR1/8ED","description":"06L STUD COUPL MALE 1/8 BSPP ED SEAL","price":57.23,"supplier":"Pirtek"},{"code":"HTS-800","description":"HOSE TIE STRAP (FRAS) X 800MM","price":48.02,"supplier":"Pirtek"},{"code":"IHCTG40-43","description":"40-43MM T-BOLT CLAMP S/S BAND C/W MILD S","price":121.13,"supplier":"Pirtek"},{"code":"IHCTG59-63","description":"59-63MM T-BOLT CLAMP S/S BAND C/W MILD S","price":163.21,"supplier":"Pirtek"},{"code":"IHCTG63-68","description":"63-68MM T-BOLT CLAMP S/S BAND C/W MILD S","price":163.21,"supplier":"Pirtek"},{"code":"IHCTG73-79","description":"73-79MM T-BOLT CLAMP S/S BAND C/W MILD S","price":215.87,"supplier":"Pirtek"},{"code":"IHCTG79-85","description":"79-85MM T-BOLT CLAMP S/S BAND C/W MILD S","price":218.61,"supplier":"Pirtek"},{"code":"IHCWM25-40","description":"25-40MM MILD STEEL WORM DRIVE CLAMP SOLI","price":36.86,"supplier":"Pirtek"},{"code":"IHCWM30-45","description":"30-45MM MILD STEEL WORM DRIVE CLAMP SOLI","price":36.86,"supplier":"Pirtek"},{"code":"IPW-16.1315.50","description":"15 DEG CHISELLING MEG NOZZLE - 1/4 NPT -","price":492.1,"supplier":"Pirtek"},{"code":"IROFSD-032020","description":"PIRTEK CLASS OIL/FUEL S&D 32MM 10 BAR (1","price":772.37,"supplier":"Pirtek"},{"code":"IROFSD-038020","description":"PIRTEK CLASS OIL/FUEL S&D 38MM 10 BAR (1","price":936.35,"supplier":"Pirtek"},{"code":"IROFSD-051020","description":"PIRTEK CLASS OIL/FUEL S&D 51MM 10 BAR (1","price":1239.77,"supplier":"Pirtek"},{"code":"IROFSD-063020","description":"PIRTEK CLASS OIL/FUEL S&D 63.5MM 10 BAR","price":648.6,"supplier":"Pirtek"},{"code":"J-09-09","description":"NIPPLE 9/16 UNO MALE X 9/16 JIC MALE","price":40.98,"supplier":"Pirtek"},{"code":"J-21-21","description":"NIPPLE 1.5/16 UNO MALE X 1.5/16 JIC MALE","price":57.41,"supplier":"Pirtek"},{"code":"J-26-21","description":"NIPPLE 1.5/8 UNO MALE X 1.5/16 JIC MALE","price":356.39,"supplier":"Pirtek"},{"code":"JB-17-30","description":"JIC MALE X BANJO METRIC","price":388.71,"supplier":"Pirtek"},{"code":"JF1-0704K","description":"7/16\" JIC FEM STR 1/4\" HOSE","price":46.15,"supplier":"Pirtek"},{"code":"JF1-0906K","description":"9/16\" JIC FEM STR 3/8\" HOSE","price":52.8,"supplier":"Pirtek"},{"code":"JF1-1208K","description":"3/4\" JIC FEM STR 1/2\" HOSE","price":73.52,"supplier":"Pirtek"},{"code":"JF1-1410K","description":"7/8\" JIC FEM STR 5/8\" HOSE","price":101.29,"supplier":"Pirtek"},{"code":"JF1-1712J","description":"1 1/16\" JIC FEM STR 3/4\" HOSE","price":135.71,"supplier":"Pirtek"},{"code":"JF1-2116J","description":"1 5/16\" JIC FEM STR 1\" HOSE","price":199.45,"supplier":"Pirtek"},{"code":"JF1-2620J","description":"1 5/8\" JIC FEM STR 1 1/4\" HOSE","price":458.74,"supplier":"Pirtek"},{"code":"JF1-3024J","description":"1 7/8\" JIC FEM STR 1 1/2\" HOSE","price":758.31,"supplier":"Pirtek"},{"code":"JF4-0704K","description":"7/16\" JIC FEM 45 DEG 1/4\" HOSE","price":341.69,"supplier":"Pirtek"},{"code":"JF4-1208K","description":"3/4\" JIC FEM 45 DEG 1/2\" HOSE","price":410.11,"supplier":"Pirtek"},{"code":"JF4-1410K","description":"7/8\" JIC FEM 45 DEG 5/8\" HOSE","price":538.23,"supplier":"Pirtek"},{"code":"JF9-0704K","description":"7/16\" JIC FEM 90 DEG 1/4\" HOSE","price":239.42,"supplier":"Pirtek"},{"code":"JF9-0704K-046","description":"7/16\" JIC FEM 90 DEG L/DROP 1/4\" HOSE","price":578.87,"supplier":"Pirtek"},{"code":"JF9-0906K","description":"9/16\" JIC FEM 90 DEG 3/8\" HOSE","price":275.48,"supplier":"Pirtek"},{"code":"JF9-0906K-056","description":"9/16\" JIC FEM 90 DEG L/DROP 3/8\" HOSE","price":670.62,"supplier":"Pirtek"},{"code":"JF9-1206K","description":"3/4\" JIC FEM 90 DEG 3/8\" HOSE","price":294.8,"supplier":"Pirtek"},{"code":"JF9-1208K-062","description":"3/4\" JIC FEM 90 DEG L/DROP 1/2\" HOSE","price":896.98,"supplier":"Pirtek"},{"code":"JF9-1410K","description":"7/8\" JIC FEM 90 DEG 5/8\" HOSE","price":154.87,"supplier":"Pirtek"},{"code":"JF9-1410K-065","description":"7/8\" JIC FEM 90 DEG L/DROP 5/8\" HOSE","price":1257.95,"supplier":"Pirtek"},{"code":"JF9-1712J","description":"1 1/16\" JIC FEM 90 DEG 3/4\" HOSE","price":602.14,"supplier":"Pirtek"},{"code":"JF9-1712J-095","description":"1 1/16\" JIC FEM 90 DEG L/DROP 3/4\" HOSE","price":1469.57,"supplier":"Pirtek"},{"code":"JFC9-1206K","description":"3/4\" JIC FEM 90 DEG COMPACT 3/8\" HOSE","price":572.58,"supplier":"Pirtek"},{"code":"KF-14-04","description":"JIS MET MALE 60\u00b0CONE/BSPT MALE","price":32.59,"supplier":"Pirtek"},{"code":"L-12-09","description":"NIPPLE 12MM MET MALE X 9/16 JIC MALE","price":19.57,"supplier":"Pirtek"},{"code":"L-14-09","description":"NIPPLE 14MM MET MALE X 9/16 JIC MALE","price":19.57,"supplier":"Pirtek"},{"code":"L-14-12","description":"NIPPLE 14MM MET MALE X 3/4 JIC MALE","price":24.36,"supplier":"Pirtek"},{"code":"L-16-09","description":"NIPPLE 16MM MET MALE X 9/16 JIC MALE","price":24.36,"supplier":"Pirtek"},{"code":"L-16-12","description":"NIPPLE 16MM MET MALE X 3/4 JIC MALE","price":24.36,"supplier":"Pirtek"},{"code":"L-18-12","description":"NIPPLE 18MM MET MALE X 3/4 JIC MALE","price":26.1,"supplier":"Pirtek"},{"code":"L-20-09","description":"NIPPLE 20MM MET MALE X 9/16 JIC MALE","price":30.88,"supplier":"Pirtek"},{"code":"L-20-12","description":"NIPPLE 20MM MET MALE X 3/4 JIC MALE","price":31.32,"supplier":"Pirtek"},{"code":"L-22-12","description":"NIPPLE 22MM MET MALE X 3/4 JIC MALE","price":28.71,"supplier":"Pirtek"},{"code":"L-22-17","description":"NIPPLE 22MM MET MALE X 1.1/16 JIC MALE","price":31.75,"supplier":"Pirtek"},{"code":"L-26-17","description":"NIPPLE 26MM MET MALE X 1.1/16 JIC MALE","price":36.53,"supplier":"Pirtek"},{"code":"L-33-21","description":"NIPPLE 33MM MET MALE X 1.5/16 JIC MALE","price":64.81,"supplier":"Pirtek"},{"code":"MET-2220","description":"22 X 2.0 TUBE","price":262.11,"supplier":"Pirtek"},{"code":"MFFB-04-04-02","description":"TEST POINT ADAPT. 9/16 ORFS X 1/8 BSPT","price":331.43,"supplier":"Pirtek"},{"code":"MFFB-06-06-02","description":"TEST POINT ADAPT. 11/16 ORFS X 1/8 BSPT","price":370.55,"supplier":"Pirtek"},{"code":"MFFB-08-08-02","description":"TEST POINT ADAPT. 13/16 ORFS X 1/8 BSPT","price":420.83,"supplier":"Pirtek"},{"code":"MFFB-10-10-02","description":"TEST POINT ADAPT. 1 ORFS X 1/8 BSPT","price":474.82,"supplier":"Pirtek"},{"code":"MFFB-12-12-02","description":"TEST POINT ADAPT. 1.3/16 ORFS X 1/8 BSPT","price":655.41,"supplier":"Pirtek"},{"code":"MFJB-12-12-02","description":"BSPT MALE X JIC MALE X TEST POINT","price":215.88,"supplier":"Pirtek"},{"code":"MFJB-17-17-02","description":"TEST POINT ADAPT. 1.1/16 JIC X 1/8 BSPT","price":331.33,"supplier":"Pirtek"},{"code":"MT2162162-1000","description":"M16X2 / M16X2 - 1000MM HOSE","price":170.93,"supplier":"Pirtek"},{"code":"MTBF1G-0402PT","description":"PRESSURE GAUGE CONNECTOR G 1/4","price":49.2,"supplier":"Pirtek"},{"code":"MTF-02","description":"DN2 MINI TEST HOSE FERRULES","price":5.07,"supplier":"Pirtek"},{"code":"MTF1-1620PT","description":"M16X2 HOSE END","price":41.08,"supplier":"Pirtek"},{"code":"MTH-02","description":"DN2 MINI TEST HOSE","price":53.25,"supplier":"Pirtek"},{"code":"MTP12165-04BPBR","description":"1/4 BSP-ED/M12.65X1.5 BUTTRESS COUPLING","price":323.73,"supplier":"Pirtek"},{"code":"MTP162-04BP","description":"TEST COUPLING 1/4\" BSPP SOFT SEAL","price":83.69,"supplier":"Pirtek"},{"code":"MTP162-M12","description":"TEST COUPLING C/W CAP M12X1.5 SOFT SEAL","price":226.88,"supplier":"Pirtek"},{"code":"OF1-0404K","description":"1/4\" ORFS FEM STR 1/4\" HOSE","price":209.08,"supplier":"Pirtek"},{"code":"OF1-0606K","description":"3/8\" ORFS FEM STR 3/8\" HOSE","price":309.33,"supplier":"Pirtek"},{"code":"OF1-0808K","description":"1/2\" ORFS FEM STR 1/2\" HOSE","price":408.1,"supplier":"Pirtek"},{"code":"OF1-1010K","description":"5/8\" ORFS FEM STR 5/8\" HOSE","price":580.85,"supplier":"Pirtek"},{"code":"OF1-1212J","description":"3/4\" ORFS FEM STR 3/4\" HOSE","price":730.54,"supplier":"Pirtek"},{"code":"OF1-1616J","description":"1\" ORFS FEM STR 1\" HOSE","price":1108.31,"supplier":"Pirtek"},{"code":"OF4-0404K","description":"1/4\" ORFS FEM 45 DEG 1/4\" HOSE","price":386.84,"supplier":"Pirtek"},{"code":"OF4-0606K","description":"3/8\" ORFS FEM 45 DEG 3/8\" HOSE","price":450.49,"supplier":"Pirtek"},{"code":"OF4-0808K","description":"1/2\" ORFS FEM 45 DEG 1/2\" HOSE","price":541.47,"supplier":"Pirtek"},{"code":"OF4-1212J","description":"3/4\" ORFS FEM 45 DEG 3/4\" HOSE","price":1105.8,"supplier":"Pirtek"},{"code":"OF4-1616J","description":"1\" ORFS FEM 45 DEG 1\" HOSE","price":1854.08,"supplier":"Pirtek"},{"code":"OF9-0404K","description":"1/4\" ORFS FEM 90 DEG 1/4\" HOSE","price":133.88,"supplier":"Pirtek"},{"code":"OF9-0606K","description":"3/8\" ORFS FEM 90 DEG 3/8\" HOSE","price":143.63,"supplier":"Pirtek"},{"code":"OF9-0606K-054","description":"3/8\" ORFS FEM 90 DEG LONG DROP 3/8\" HOSE","price":912.25,"supplier":"Pirtek"},{"code":"OF9-0808K","description":"1/2\" ORFS FEM 90 DEG 1/2\" HOSE","price":186.42,"supplier":"Pirtek"},{"code":"OF9-1010K","description":"5/8\" ORFS FEM 90 DEG 5/8\" HOSE","price":918.29,"supplier":"Pirtek"},{"code":"OF9-1212J","description":"3/4\" ORFS FEM 90 DEG 3/4\" HOSE","price":1177.25,"supplier":"Pirtek"},{"code":"OF9-1616J","description":"1\" ORFS FEM 90 DEG 1\" HOSE","price":1670.13,"supplier":"Pirtek"},{"code":"P-07-07","description":"NIPPLE 7/16 JIC MALE X 7/16 JIC MALE","price":10.44,"supplier":"Pirtek"},{"code":"P-09-09","description":"NIPPLE 9/16 JIC MALE X 9/16 JIC MALE","price":12.61,"supplier":"Pirtek"},{"code":"P-12-12","description":"NIPPLE 3/4 JIC MALE X 3/4 JIC MALE","price":18.7,"supplier":"Pirtek"},{"code":"P-17-17","description":"NIPPLE 1.1/16 JIC MALE X 1.1/16 JIC MALE","price":33.06,"supplier":"Pirtek"},{"code":"P-21-21","description":"NIPPLE 1.5/16 JIC MALE X 1.5/16 JIC MALE","price":56.54,"supplier":"Pirtek"},{"code":"PC35-06","description":"HYDRAULIC HOSE 350 BAR 3/8\".","price":109.67,"supplier":"Pirtek"},{"code":"PC35-08","description":"HYDRAULIC HOSE 350 BAR 1/2\".","price":186.21,"supplier":"Pirtek"},{"code":"PC35-10","description":"HYDRAULIC HOSE 350 BAR 5/8\".","price":333.12,"supplier":"Pirtek"},{"code":"PC35-12","description":"HYDRAULIC HOSE 350 BAR 3/4\".","price":326.19,"supplier":"Pirtek"},{"code":"PC35-16","description":"HYDRAULIC HOSE 350 BAR 1\".","price":461.28,"supplier":"Pirtek"},{"code":"PC42-04","description":"HYDRAULIC HOSE 420 BAR 1/4\".","price":101.19,"supplier":"Pirtek"},{"code":"PJS-007","description":"STANDARD PELLET - 7 MM 300 P/BAG (SUIT H","price":3.23,"supplier":"Pirtek"},{"code":"PJS-010","description":"STANDARD PELLET - 10 MM 300 P/BAG (SUIT","price":3.54,"supplier":"Pirtek"},{"code":"PJS-012","description":"STANDARD PELLET - 12 MM 300 P/BAG (SUIT","price":4.02,"supplier":"Pirtek"},{"code":"PJS-016","description":"STANDARD PELLET - 16 MM 300 P/BAG (SUIT","price":5.01,"supplier":"Pirtek"},{"code":"PJS-020","description":"STANDARD PELLET - 20 MM 300 P/BAG (SUIT","price":6.26,"supplier":"Pirtek"},{"code":"Q-16","description":"DOWTY WASHER METRIC","price":47.26,"supplier":"Pirtek"},{"code":"R-07-07","description":"NIPPLE 7/16 JIC MALE X JIC MALE B/HD","price":26.97,"supplier":"Pirtek"},{"code":"R-08-08","description":"NIPPLE 1/2 JIC MALE X JIC MALE B/HD","price":102.68,"supplier":"Pirtek"},{"code":"R-09-09","description":"NIPPLE 9/16 JIC MALE X JIC MALE B/HD","price":36.97,"supplier":"Pirtek"},{"code":"R-10-10","description":"NIPPLE 5/8 SAE MALE X SAE MALE B/HD","price":101.13,"supplier":"Pirtek"},{"code":"R-12-12","description":"NIPPLE 3/4 JIC MALE X JIC MALE B/HD","price":49.15,"supplier":"Pirtek"},{"code":"R-17-17","description":"NIPPLE 1.1/16 JIC MALE X JIC MALE B/HD","price":96.12,"supplier":"Pirtek"},{"code":"R-21-21","description":"NIPPLE 1.5/16 JIC MALE X JIC MALE B/HD","price":424.41,"supplier":"Pirtek"},{"code":"R2AT-20","description":"R2AT (2SN) 1.1/4\" HOSE","price":395.02,"supplier":"Pirtek"},{"code":"R2AT-24","description":"R2AT (2SN) 1.1/2\" HOSE","price":501.61,"supplier":"Pirtek"},{"code":"R2AT-32","description":"R2AT (2SN) 2\" HOSE","price":2334.95,"supplier":"Pirtek"},{"code":"R2ATHT-06","description":"2SN 3/8\" HIGH TEMP","price":613.68,"supplier":"Pirtek"},{"code":"R2ATHT-08","description":"2SN 1/2\" HIGH TEMP","price":716.98,"supplier":"Pirtek"},{"code":"R2ATHT-10","description":"2SN 5/8\" HIGH TEMP","price":848.06,"supplier":"Pirtek"},{"code":"R2ATHT-12","description":"2SN 3/4\" HIGH TEMP","price":1074.21,"supplier":"Pirtek"},{"code":"R2ATHT-16","description":"2SN 1\" HIGH TEMP","price":1539.99,"supplier":"Pirtek"},{"code":"RI-04-02","description":"REDUCING COUPLING 1/4 M X 1/8 F BSPP ED","price":47.81,"supplier":"Pirtek"},{"code":"RX-09-09","description":"BULKHEAD JIC MALE X JIC MALE EXTENDED","price":252.78,"supplier":"Pirtek"},{"code":"RX-12-12","description":"BULKHEAD JIC MALE X JIC MALE EXTENDED","price":185.66,"supplier":"Pirtek"},{"code":"RX-14-14","description":"BULKHEAD JIC MALE X JIC MALE EXTENDED","price":331.36,"supplier":"Pirtek"},{"code":"RX-17-17","description":"BULKHEAD JIC MALE X JIC MALE EXTENDED","price":323.5,"supplier":"Pirtek"},{"code":"SSG-020BL","description":"SPIRAL SAFETY GUARD 20 MM O.D (BOX 20M)","price":40.13,"supplier":"Pirtek"},{"code":"SSG-025BL","description":"SPIRAL SAFETY GUARD 25 MM O.D (BOX 20M)","price":49.47,"supplier":"Pirtek"},{"code":"SSG-032BL","description":"SPIRAL SAFETY GUARD 32 MM O.D (BOX 20M)","price":68.75,"supplier":"Pirtek"},{"code":"SSG-040BL","description":"SPIRAL SAFETY GUARD 40 MM O.D (BOX 20M)","price":91.19,"supplier":"Pirtek"},{"code":"SSG-050BL","description":"SPIRAL SAFETY GUARD 50 MM O.D (BOX 20M)","price":126.0,"supplier":"Pirtek"},{"code":"SSG-075BL","description":"SPIRAL SAFETY GUARD 75 MM O.D (BOX 15M)","price":260.81,"supplier":"Pirtek"},{"code":"SSG-090BL","description":"SPIRAL SAFETY GUARD 90 MM O.D (BOX 10M)","price":1039.92,"supplier":"Pirtek"},{"code":"TMU-04","description":"JIC/UNF MALE PLUG","price":6.44,"supplier":"Pirtek"},{"code":"TMU-06","description":"JIC/UNF MALE PLUG","price":2.83,"supplier":"Pirtek"},{"code":"TMU-08","description":"JIC/UNF MALE PLUG","price":3.55,"supplier":"Pirtek"},{"code":"TMU-10","description":"JIC/UNF MALE PLUG","price":11.61,"supplier":"Pirtek"},{"code":"TMU-12","description":"JIC/UNF MALE PLUG","price":13.86,"supplier":"Pirtek"},{"code":"TMU-16","description":"JIC/UNF MALE PLUG","price":18.15,"supplier":"Pirtek"},{"code":"TPR7-03","description":"HOSE - 100R7 BLACK","price":130.58,"supplier":"Pirtek"},{"code":"VB200-000-057-1000","description":"VENA SIL 200 SILICONE HOSE","price":2304.3,"supplier":"Pirtek"},{"code":"VSTIR-1","description":"SOCKET HEAD PORT PLUG 1 BSPP ED","price":84.76,"supplier":"Pirtek"},{"code":"VSTIR-1/2","description":"SOCKET HEAD PORT PLUG 1/2 BSPP ED","price":44.19,"supplier":"Pirtek"},{"code":"VSTIR-1/4","description":"SOCKET HEAD PORT PLUG 1/4 BSPP ED","price":9.56,"supplier":"Pirtek"},{"code":"VSTIR-1/8","description":"SOCKET HEAD PORT PLUG 1/8 BSPP ED","price":6.75,"supplier":"Pirtek"},{"code":"VSTIR-3/4","description":"SOCKET HEAD PORT PLUG 3/4 BSPP ED","price":68.1,"supplier":"Pirtek"},{"code":"VSTIR-3/8","description":"SOCKET HEAD PORT PLUG 3/8 BSPP ED","price":9.56,"supplier":"Pirtek"},{"code":"W-06-04","description":"SOCKET 3/8 BSPT FEM X 1/4 BSPT FEM","price":55.69,"supplier":"Pirtek"},{"code":"W-12S","description":"12S 90\u00ba ELBOW COUPLING","price":66.67,"supplier":"Pirtek"},{"code":"WE-12SRK3/8","description":"12S 90\u00ba ELB COUPL MALE 3/8 BSPT","price":137.65,"supplier":"Pirtek"},{"code":"WE-15LRK1/2","description":"15L 90\u00ba ELB COUPL MALE 1/2 BSPT","price":167.35,"supplier":"Pirtek"},{"code":"WJ-04-09","description":"SOCKET BSPP FEMALE X JIC FEMALE","price":89.65,"supplier":"Pirtek"},{"code":"WP-04-04","description":"SOCKET 1/4\" BSPP F X 1/4\" BSPP FEM STR","price":73.52,"supplier":"Pirtek"},{"code":"Z-04","description":"DOWTY WASHER 1/4 BSPP","price":15.24,"supplier":"Pirtek"},{"code":"Z-06","description":"DOWTY WASHER 3/8 BSPP","price":16.55,"supplier":"Pirtek"},{"code":"Z-08","description":"DOWTY WASHER 1/2 BSPP","price":19.16,"supplier":"Pirtek"},{"code":"Z-12","description":"DOWTY WASHER 3/4 BSPP","price":24.39,"supplier":"Pirtek"},{"code":"Z-16","description":"DOWTY WASHER 1 BSPP","price":35.99,"supplier":"Pirtek"},{"code":"PO","description":"170.1X195X150 POLISH","price":450.0,"supplier":"AC HONED"},{"code":"HTS","description":"55X65X1595 HTS","price":1276.0,"supplier":"AC HONED"},{"code":"100X200H","description":"100X120X680 HT","price":1744.0,"supplier":"AC HONED"},{"code":"BOM-WR","description":"6MM 6X19 IWRC STEEL WIRE ROPE SLING","price":375.2,"supplier":"ACTUM"},{"code":"HYD011","description":"HYDRA HM 68-210LT","price":8064.0,"supplier":"ATLAS OIL"},{"code":"AGO600","description":"SPIRAX S4 TXM 20LT","price":1531.0,"supplier":"ATLAS OIL"},{"code":"BEN-50X30RND","description":"50X3.0 RND M/S, ES10000-511-00241","price":775.0,"supplier":"BEND-A-TUBE"},{"code":"32008","description":"TAPERED RLR BRG 40X68X19 NSK","price":151.83,"supplier":"BMG"},{"code":"SM 10012012 VF","description":"METRIC OIL SEAL VITON","price":144.0,"supplier":"BMG"},{"code":"6003 ZZC3","description":"DWP GROOVE BALL BEARING 17X35X10","price":36.89,"supplier":"BMG"},{"code":"IRT 1012","description":"INNE RING SHELL TYPE 10X13X12.500","price":33.15,"supplier":"BMG"},{"code":"K 94700","description":"CONE TAPERED RLR 177.800X63.500 TIM","price":15630.0,"supplier":"BMG"},{"code":"K 94113","description":"CUP TAPERED RLR 288.925X47.625","price":13135.0,"supplier":"BMG"},{"code":"MI 775875 1/2 MC","description":"7.3/4 X 8.3/4 X 1/2 METAL CASE","price":5400.0,"supplier":"BMG"},{"code":"HDPE262423PEL017","description":"PLG, 23P BLK E RING 16 P","price":1483.82,"supplier":"BRENO"},{"code":"HDPE242425SEL017","description":"REC, 23P, BLK, E, RNG","price":1035.0,"supplier":"BRENO"},{"code":"HDPE241814SEL017","description":"REC, 14P, BLK, E, RNG","price":996.0,"supplier":"BRENO"},{"code":"HDPE26-18-14PE","description":"PLG, 14P, BLK, E, 16","price":1227.93,"supplier":"BRENO"},{"code":"DT06-2S-E008","description":"PLG, 2P, GREY, N XCAP","price":73.52,"supplier":"BRENO"},{"code":"B0460-202-16141","description":"PIN SOLID SIZE 16-20AW","price":14.19,"supplier":"BRENO"},{"code":"B0462-209-26141","description":"SOCKET SOLID SIZE 16 1","price":19.6,"supplier":"BRENO"},{"code":"B2411-001-2405","description":"PANE NUT, SIZE 24, HD","price":117.43,"supplier":"BRENO"},{"code":"B2414-001-2486","description":"DEUTSCH WASHER HDP20","price":93.15,"supplier":"BRENO"},{"code":"B2411-002-1805","description":"DEUTSCH NUT HDP20","price":66.75,"supplier":"BRENO"},{"code":"B114021-ZZ","description":"LOCK WASHER SIZE 18 HD","price":54.72,"supplier":"BRENO"},{"code":"W2S","description":"WEDGE 2 WAY ORANGE","price":3.23,"supplier":"BRENO"},{"code":"B0462-209-16141","description":"SOCKET SOLID SIZE 16 1","price":19.6,"supplier":"BRENO"},{"code":"E2922TERM","description":"TERM FEM 6.3 W/TONGUE","price":241.44,"supplier":"BRENO"},{"code":"E2922MINI","description":"TERM FEM MINI BRASS P/","price":172.79,"supplier":"BRENO"},{"code":"HTF2KIT","description":"2 WAY DEUTSCH F+M KIT","price":155.61,"supplier":"BRENO"},{"code":"HTF12KIT","description":"12 WAY DEUTSCH F+M KIT","price":806.09,"supplier":"BRENO"},{"code":"B1011-247-1205","description":"BASCHELL 12 PIN FEMALE","price":68.78,"supplier":"BRENO"},{"code":"B1011-249-1205","description":"BACK SHELL 12 PIN MALE","price":68.78,"supplier":"BRENO"},{"code":"DUR-GLFCPINS","description":"GLFC PINS 100X420","price":2045.0,"supplier":"DUROTEC"},{"code":"DUR-GHCGROD1","description":"GHCG ROD 110X715","price":3830.0,"supplier":"DUROTEC"},{"code":"DUR-SRROD","description":"S/R ROD","price":2747.0,"supplier":"DUROTEC"},{"code":"DUR-GHCGROD8","description":"GHCG ROD 80X615","price":2396.0,"supplier":"DUROTEC"},{"code":"DUR-GHCGROD8-2","description":"GHCG ROD 80X585","price":2279.0,"supplier":"DUROTEC"},{"code":"DUR-SRRODS50","description":"S/R RODS 50X540","price":738.0,"supplier":"DUROTEC"},{"code":"DUR-SRROD85X","description":"S/R ROD 85X640","price":1487.0,"supplier":"DUROTEC"},{"code":"DUR-GHCG32X1","description":"GHCG 32X1425 RODS","price":2220.0,"supplier":"DUROTEC"},{"code":"DUR-IHCSTOCK","description":"I/H C/STOCK 20X180","price":50.0,"supplier":"DUROTEC"},{"code":"DUR-GHCGRODS","description":"GHCG RODS 85X650","price":2691.0,"supplier":"DUROTEC"},{"code":"DUR-IHCSTOCK-2","description":"I/H C/STOCK 32X1500","price":684.0,"supplier":"DUROTEC"},{"code":"DUR-GHCGROD7","description":"GHCG ROD 70X365","price":1244.0,"supplier":"DUROTEC"},{"code":"DUR-GHCG70X3","description":"GHCG 70X365 ROD","price":1244.0,"supplier":"DUROTEC"},{"code":"DUR-GHCG110X","description":"GHCG 110X715 RODS","price":3830.0,"supplier":"DUROTEC"},{"code":"01","description":"L/H 70X790 C/STOCK","price":1845.0,"supplier":"DUROTEC"},{"code":"83111AM6X20","description":"HY BALL KNOB - BAKELITE M 6X20MM","price":39.0,"supplier":"EASSON-VERTEX"},{"code":"NS-P-LAP-1119341","description":"OLFLEX CLASSIC 110 41G X 1,5MM","price":532.86,"supplier":"ELECTRAHERTZ"},{"code":"NS-J-AM 1119902","description":"LFLEX CLASSIC 110 2G X 1,5MM","price":27.79,"supplier":"ELECTRAHERTZ"},{"code":"46913A","description":"GROUP MARK SUPP -END STOPS 6MM","price":12.7,"supplier":"ELECTRAHERTZ"},{"code":"LH-MP-12/3MB","description":"ADHESIVE MNT BLACK 12.5X12.5MM","price":49.0,"supplier":"ELECTRAHERTZ"},{"code":"F2-6.4VQD","description":"FM INS DISC TERM BLUE 6.4MM","price":202.0,"supplier":"ELECTRAHERTZ"},{"code":"F1-6.4VQD","description":"FM INS DISC TERM BLUE 6.4MM","price":191.0,"supplier":"ELECTRAHERTZ"},{"code":"EAM32/M40H","description":"ADAPT M ENLG M32XM40 NICKEL","price":149.0,"supplier":"ELECTRAHERTZ"},{"code":"PJ-SWB-06","description":"HDPE SPIRAL BINDING 4BLK 10M/ROLL","price":20.6,"supplier":"ELECTRAHERTZ"},{"code":"PJ-SWB-12","description":"HDPE SPIRAL BINDING 9 BLK 10M/ROLL","price":53.0,"supplier":"ELECTRAHERTZ"},{"code":"PJ-SWB-19","description":"HDPE SPIRAL BINDING 15 BLK 10M/ROLL","price":149.0,"supplier":"ELECTRAHERTZ"},{"code":"R5-8V","description":"RING TERN YELL 4.0-6.0 8.4MM","price":326.0,"supplier":"ELECTRAHERTZ"},{"code":"R5-10V","description":"RING TERM YELL 4.0-6.0 10.5MM","price":326.0,"supplier":"ELECTRAHERTZ"},{"code":"R5-6V","description":"RING TERM YELL 4.0-6.0 6.5MM","price":264.0,"supplier":"ELECTRAHERTZ"},{"code":"R2-6V","description":"RING TERM BLUE 1.5-2.5 6.5MM","price":179.0,"supplier":"ELECTRAHERTZ"},{"code":"DMK70","description":"MONITOR 3PH VOLTAGE METER","price":416.8,"supplier":"ELECTRAHERTZ"},{"code":"DD0016320","description":"MARKER WS 12/5 MC NE WS 1609860000","price":1.84,"supplier":"EPS"},{"code":"D0016506","description":"WEIDMULLER TERMINAL W-SERIES WDU","price":68.02,"supplier":"EPS"},{"code":"PLAGNITRIFLEX","description":"GLOVE NITRILE COATED BLACK SIZE 10","price":30.33,"supplier":"EWN&S"},{"code":"EAP0055","description":"MASKING TAPE 48MM","price":35.8,"supplier":"EWN&S"},{"code":"PFS67664115","description":"POLIFAN DISC 115X40","price":33.86,"supplier":"EWN&S"},{"code":"PFS69902097","description":"GRINDING DISC 230-7 A30 PSF","price":91.52,"supplier":"EWN&S"},{"code":"L-CLEAR","description":"LENSES CLEAR 108X51","price":1.35,"supplier":"EWN&S"},{"code":"PLAO-RAGS","description":"POLO RAGS 5KG","price":17.73,"supplier":"EWN&S"},{"code":"13-1003234","description":"PVC RED SMOOTH SHOULDER GLOVES","price":26.1,"supplier":"EWN&S"},{"code":"CN/ANM/2.4","description":"CUTTING NOZZLE ANM 2.4MM","price":58.75,"supplier":"EWN&S"},{"code":"PL50-GASKET7468","description":"GASKET SEALANT MARKER GD GREY 310ML","price":225.0,"supplier":"EWN&S"},{"code":"LSA6FS0504006","description":"FLAPPERWHEEL 50 X 40 P60","price":75.95,"supplier":"EWN&S"},{"code":"SPE-EURO-C","description":"SPECTACLE EURO CLEAR","price":7.46,"supplier":"EWN&S"},{"code":"PFS14300030","description":"DEBURRING BLADES BS2010","price":47.52,"supplier":"EWN&S"},{"code":"PFS69902091","description":"GRINDING DISC 115-6A PSF","price":35.21,"supplier":"EWN&S"},{"code":"HC-GM6","description":"HOSE CLAMP GM6 10-22MM","price":3.7,"supplier":"EWN&S"},{"code":"PLOA-RAGS","description":"POLO RAGS 5KG","price":19.88,"supplier":"EWN&S"},{"code":"1-7001935","description":"MARKING BLUE ENGINEERING HERSCHELL 300ML","price":76.35,"supplier":"EWN&S"},{"code":"MATSHI0010","description":"SHIELD TOOL IN A CAN 500ML","price":62.22,"supplier":"EWN&S"},{"code":"BRSH009","description":"BROOM 24 HARD","price":118.2,"supplier":"EWN&S"},{"code":"FLOWMETER","description":"FLOWMETER ARGON","price":341.6,"supplier":"EWN&S"},{"code":"CN/ANM/1.6","description":"CUTTING NOZZLE ANM 1.6MM","price":51.2,"supplier":"EWN&S"},{"code":"D/MASKFF2","description":"DUST MASK FFP2","price":2.95,"supplier":"EWN&S"},{"code":"PNC13-1002444","description":"DISPOSABLE OVERALL TYPE 4/5/6 MEDIUM","price":42.5,"supplier":"EWN&S"},{"code":"DROIWFRZ10ORANG","description":"DROMEX ORANGE SYNTHETIC FREEZER GLOVES","price":62.0,"supplier":"EWN&S"},{"code":"LSA6FS0302006","description":"FLAPPERWHEEL 30X20 P60","price":49.63,"supplier":"EWN&S"},{"code":"6FS0201506080","description":"FLAPPERWHEEL SFL02015.06 NK80","price":42.87,"supplier":"EWN&S"},{"code":"CESW8903/W","description":"ARDROX 8903/W WHITE CONTRAST","price":250.24,"supplier":"EWN&S"},{"code":"BTWECP6255","description":"ECLIPSE POWERSWA BLADE 500X40X6TPI","price":963.75,"supplier":"EWN&S"},{"code":"MATEC P6170","description":"ECLIPSE BLADE S/PROOF 18TPI","price":24.95,"supplier":"EWN&S"},{"code":"P00022470","description":"8X17X4MM NITRILE RING","price":2.5,"supplier":"GASKET MAN"},{"code":"P00027821","description":"438.5X463X1.5MM PREMIUM 23HX13 OBLONG","price":1724.98,"supplier":"GASKET MAN CC"},{"code":"GAW-55KW500V","description":"55KW 500V 4P VEM MOTOR J/N: 150-5-26","price":15784.0,"supplier":"GAUTENG ARMATURE WINDERS"},{"code":"GAW-11KW1000","description":"11KW 1000V 2P WEG MOTOR J/N: 153-5-26","price":9722.03,"supplier":"GAUTENG ARMATURE WINDERS"},{"code":"ROTO-30","description":"ROD ROTO 30IDX40.7ODX4.2W #220","price":115.0,"supplier":"HST"},{"code":"ORN-220","description":"O RING 34.52MMX3.53MM NBR70","price":1.9,"supplier":"HST"},{"code":"RK030040.704.2","description":"ROD.KOPP.30ID X 40.7OD X 4.2W-#221","price":40.0,"supplier":"HST"},{"code":"ORN070-2-90","description":"O RING 70MM X 2MM NBR90","price":5.85,"supplier":"HST"},{"code":"ORN-242","description":"O RING 101.19MM X 3.53 NBR70","price":7.5,"supplier":"HST"},{"code":"ES-KIT50X100","description":"SMALL KIT APS 50X100","price":275.0,"supplier":"HST"},{"code":"ES-KIT85X125","description":"BIG KIT 85X125","price":390.0,"supplier":"HST"},{"code":"ORN-032","description":"O RING 47.35MM X 1.78MM NBR70","price":1.55,"supplier":"HST"},{"code":"ORV017.3-2.4","description":"O RING 17.3MM X 2.4MM VITON","price":5.5,"supplier":"HST"},{"code":"ORN-012-90","description":"O RING 9.25MM X 1.78MM NBR90","price":0.8,"supplier":"HST"},{"code":"ORV-111","description":"O RING 10.78MM X 2.62MM VITON","price":3.7,"supplier":"HST"},{"code":"BU111-P","description":"BACK UP 111 PTFE 10.80 X 2.62","price":21.0,"supplier":"HST"},{"code":"ORV016.3-2.4","description":"O RING 16.3MM X 2.4MM VITON","price":4.5,"supplier":"HST"},{"code":"ORN-014-90","description":"O RING 12.42 X 1.78MM NBR90","price":0.8,"supplier":"HST"},{"code":"BU014","description":"BACK UP 8-014","price":1.75,"supplier":"HST"},{"code":"ORN012-2-90","description":"O RING 12MM X 2MM NBR90","price":1.0,"supplier":"HST"},{"code":"ORN-020-90","description":"O RING 21.95MM X 1.78MM NBR90","price":1.15,"supplier":"HST"},{"code":"ORN-013-90","description":"O RING 10.82MM X 1.78MM NBR90","price":0.8,"supplier":"HST"},{"code":"BU013-SP","description":"BACK UP 013-PTFE 11ID X 1.3CS X 0.8THK","price":8.8,"supplier":"HST"},{"code":"ORN-016-90","description":"O RING 15.60MM X 1.78MM NBR90","price":0.85,"supplier":"HST"},{"code":"ORN-011-90","description":"O RING 7.65MM X 1.78MM NBR90","price":0.8,"supplier":"HST"},{"code":"BU125","description":"BACK UP 8-125","price":3.2,"supplier":"HST"},{"code":"ORN184.4-5.7","description":"O RING 184.3MM X 5.7MM NBR70","price":38.0,"supplier":"HST"},{"code":"HVB-A7202BEA","description":"A7202 BEARING NSK","price":265.0,"supplier":"HVB BEARING"},{"code":"T32016","description":"T32016 VBF","price":190.0,"supplier":"HVB BEARING"},{"code":"80X100X10","description":"SEALS","price":30.0,"supplier":"HVB BEARING"},{"code":"A6508-2RSC3","description":"6308-2RSC3 BEARINGS NSK","price":220.0,"supplier":"HVB BEARING"},{"code":"EXT90","description":"090 CIRCLIP","price":10.2,"supplier":"HVB BEARING"},{"code":"INT200","description":"200 CIRCLIP","price":63.0,"supplier":"HVB BEARING"},{"code":"1MI-GILA30A","description":"1/2 SIGHT GLASS(ALUMINIUM)","price":110.0,"supplier":"HYDROMOBILE"},{"code":"CSAB040P03A-L","description":"3/4\"SPIN-ON 3MIC BREATHER","price":1636.0,"supplier":"HYDROSALES"},{"code":"5504912","description":"TNMG 160408-TF","price":176.0,"supplier":"ISCAR"},{"code":"6402790","description":"GIPI 4.00E-0.40","price":509.0,"supplier":"ISCAR"},{"code":"5651081","description":"EC-A4 10-22C10E72","price":1210.0,"supplier":"ISCAR"},{"code":"5592971","description":"CCMT 09T304-PF","price":166.0,"supplier":"ISCAR"},{"code":"5505571","description":"TCMT 16T304-SM","price":210.0,"supplier":"ISCAR"},{"code":"5505127","description":"TNMG 220408-TF","price":248.0,"supplier":"ISCAR"},{"code":"3600900","description":"SDNCN 1010F-07","price":1610.0,"supplier":"ISCAR"},{"code":"5505156","description":"DCMT 070204-SM","price":147.0,"supplier":"ISCAR"},{"code":"5651080","description":"EC-A4 08-20C08E63","price":867.0,"supplier":"ISCAR"},{"code":"5607423","description":"HM390 TDKT 1505PDR","price":334.0,"supplier":"ISCAR"},{"code":"5504878","description":"VCMT 160408-SM","price":264.0,"supplier":"ISCAR"},{"code":"5606332","description":"ONMU 050505-TN-MM","price":362.0,"supplier":"ISCAR"},{"code":"3316196","description":"138-020-05 / 08-06-057-3R-A","price":630.0,"supplier":"ISCAR"},{"code":"9.751-140","description":"JET PIPE FOR REPLACE","price":680.0,"supplier":"KARCHER"},{"code":"2.883-894","description":"POWER NOZZLE 25047","price":350.0,"supplier":"KARCHER"},{"code":"4.760-843","description":"PISTOL CLASSIC M 155","price":1010.0,"supplier":"KARCHER"},{"code":"5.401-210","description":"SCREW CONNECTO PART","price":135.0,"supplier":"KARCHER"},{"code":"6.296-124","description":"RM 81 DIRECT","price":1234.0,"supplier":"KARCHER"},{"code":"246291","description":"COIL 4201576","price":1500.0,"supplier":"M AND R POWER COMPONENTS"},{"code":"208805","description":"BLEEDER SCREWS (4699701)","price":35.0,"supplier":"M AND R POWER COMPONENTS"},{"code":"GAS-1008","description":"ARGOSHIELD 5 CYLINDER REFILL","price":861.0,"supplier":"MEARON"},{"code":"GAS-1022","description":"OXYGEN TEC CYLINDERREFILL","price":453.0,"supplier":"MEARON"},{"code":"NS-WEC-1985","description":"1.4MM CONTACT TIP M8","price":11.5,"supplier":"MEARON"},{"code":"NS-WEC-2837","description":"CONTACT TIP M8 1.2","price":11.5,"supplier":"MEARON"},{"code":"PPE-1437","description":"VIP TIP GLOVE GOAT SKIN XXLARGE","price":41.0,"supplier":"MEARON"},{"code":"ABR-1002","description":"DISC FRIND PFERD 115 69902091 PS/F","price":37.4,"supplier":"MEARON"},{"code":"ABR-1011","description":"115MM PFERD POLYFAN PFF Z40 STEELOX","price":40.0,"supplier":"MEARON"},{"code":"WEC-1523","description":"2.4MM TAURUS MILD STEEL TIG ROD 70S-6","price":40.0,"supplier":"MEARON"},{"code":"PPE-1265","description":"FFP1 DISPOSABLE DUST MASK","price":3.0,"supplier":"MEARON"},{"code":"NS-GEC-1091","description":"ANM CUTTING NOZZLE 1.6MM (1/16\") 12-75MM","price":74.95,"supplier":"MEARON"},{"code":"PPE-1135","description":"SLEAR LENS-FLIP FRONT HELMET GLASS","price":3.5,"supplier":"MEARON"},{"code":"NS-ABR-1044","description":"SFL 05030.06 NK60 CRS FLAPPER 2STR","price":72.0,"supplier":"MEARON"},{"code":"PPE-1528","description":"BLACK NITRILE GLOVES","price":22.8,"supplier":"MEARON"},{"code":"NS-HAR-1377","description":"TAPMATIC NO 1 5L","price":999.6,"supplier":"MEARON"},{"code":"WEC-1073","description":"1.20MM MIG 6000","price":48.1,"supplier":"MEARON"},{"code":"NS-GEC-1090","description":"ANM CUTTING NOZZLE 1.2MM (3/64) 6-12MM","price":74.95,"supplier":"MEARON"},{"code":"GAS-1007","description":"AGRON TEC CYLINDER REFILL","price":1221.4,"supplier":"MEARON"},{"code":"ABR-1062","description":"ALUMINIUM GRINDING DISC E115-7SG ALU","price":127.65,"supplier":"MEARON"},{"code":"NS-WEC-3859","description":"BOILER MAKER CHALK 144 PIECES","price":231.25,"supplier":"MEARON"},{"code":"PPE-1472","description":"VIP TIG WELDING GLOVES (GOAT SKIN)","price":41.0,"supplier":"MEARON"},{"code":"WEC-1001","description":"ANTI SPATTER SILICONE SPRAY","price":51.8,"supplier":"MEARON"},{"code":"PPE-1078","description":"CLEAR EURO SAFETY SPECTACLE","price":9.95,"supplier":"MEARON"},{"code":"PPE-1035","description":"8' GREEN LINED GLOVES 20CM CUFF","price":51.6,"supplier":"MEARON"},{"code":"NS-HAR-2440","description":"CABLETIE HT BLACK 300X4.6MM PK 100","price":212.0,"supplier":"MEARON"},{"code":"ABR-1009","description":"PFERD 115X1 CUTTING DISC","price":28.3,"supplier":"MEARON"},{"code":"PPE-1329","description":"VISOR ONLY CLEAR FOR FACESHIELD","price":38.7,"supplier":"MEARON"},{"code":"NS-HAR-3229","description":"GENKEM ADHESIVE CONTACT","price":183.1,"supplier":"MEARON"},{"code":"NS-ABR-1103","description":"SFL 02515.06 NK80 CRS FLAPPER 2STR","price":49.1,"supplier":"MEARON"},{"code":"NSHAR-3132","description":"LEKTRO KLEEN 400ML (EDP)","price":105.0,"supplier":"MEARON"},{"code":"WEC-2661","description":"SHROUD BNZ 501 CONICAL","price":70.3,"supplier":"MEARON"},{"code":"NS-PPE-1085","description":"CHROME LEATHER YOKE (2XL)","price":155.0,"supplier":"MEARON"},{"code":"GEC-1074","description":"FLOWMETER ARGON BRASS","price":585.35,"supplier":"MEARON"},{"code":"NS-ABR-1190","description":"30MMX15MM MOUNTED FLAP WHEEL P80","price":48.2,"supplier":"MEARON"},{"code":"NS-ABR-1042","description":"SFL 02515.06 NK80 CRS FLAPPER 2STR","price":48.2,"supplier":"MEARON"},{"code":"NS-HAR-1955","description":"CABLE TIES 200MMX4.6MM","price":114.4,"supplier":"MEARON"},{"code":"MAM-1020","description":"ENG MARKING BLUE 350ML (EP)","price":82.5,"supplier":"MEARON"},{"code":"NS-WEC-1812","description":"ARDROX 8903/W WHITE CONTRAST","price":189.0,"supplier":"MEARON"},{"code":"NS-HAR-3228","description":"SHIELD TOOL IN A CAN 500ML","price":76.9,"supplier":"MEARON"},{"code":"MEP02","description":"200 TON POLYURETHANE WHEEL CHOCK","price":1650.0,"supplier":"MINING EMPORIUM"},{"code":"K28985-XC2279-DB TKN","description":"TDO ASSEMBLY","price":11500.0,"supplier":"MPOWER BEARINGS"},{"code":"K 462 TKN","description":"TS CONE","price":650.0,"supplier":"MPOWER BEARINGS"},{"code":"K 453X TKN","description":"TS CUP","price":416.0,"supplier":"MPOWER BEARINGS"},{"code":"NU2210ECJC3 SKF","description":"CRB-CYLINDRICAL BEARING","price":960.0,"supplier":"MPOWER BEARINGS"},{"code":"720CYDGLP4 NACHI","description":"ACBB - ANGULAR CONTACT BEARING SUPER PRECISION","price":1175.0,"supplier":"MPOWER BEARINGS"},{"code":"SEAL 30X55X7","description":"METRIC OIL SEAL","price":15.0,"supplier":"MPOWER BEARINGS"},{"code":"PAL001","description":"PALLET 1200X500","price":247.0,"supplier":"MULTI TASK"},{"code":"MU1-VCOILINS","description":"V-COIL INSERT UNF 3/4X16X1.5D","price":98.0,"supplier":"MULTI TOOL"},{"code":"MU1-HEATINGN","description":"HEATING NOZZLE 4H","price":682.0,"supplier":"MULTI TOOL"},{"code":"MU1-HEATINGN-2","description":"HEATING NOZZLE 5H","price":924.0,"supplier":"MULTI TOOL"},{"code":"MU1-INTERNAL","description":"INTERNAL CIRCLIP SET 300PC","price":232.0,"supplier":"MULTI TOOL"},{"code":"MU1-12NPTTAP","description":"1/2\" NPT TAP BOTT","price":1210.0,"supplier":"MULTI TOOL"},{"code":"MU1-GASKETSE","description":"GASKET SEALER 100GM BLUE HYLOMAR","price":362.0,"supplier":"MULTI TOOL"},{"code":"1332509","description":"250ML ELECTRIC BLUE FD SPRAY PAINT","price":78.0,"supplier":"MULTI TOOL"},{"code":"065MTL6628580K","description":"16MM P-CLIP RUBBER LINED ZP","price":18.0,"supplier":"MULTI TOOL"},{"code":"065KEN4452060K","description":"150MM AMERICAN PATTERN BENCH VISE","price":4240.0,"supplier":"MULTI TOOL"},{"code":"MU1-DISPOSAB","description":"DISPOSABLE REBEL COVERALL M","price":98.0,"supplier":"MULTI TOOL"},{"code":"MU1-DISPOSAB-2","description":"DISPOSABLE REBEL COVERALL LARGE","price":98.0,"supplier":"MULTI TOOL"},{"code":"MU1-DISPOSAB-3","description":"DISPOSABLE REBEL COVERALL SMALL","price":98.0,"supplier":"MULTI TOOL"},{"code":"MU1-MARKERTA","description":"MARKER TAMPER CHECK GREEN 30ML","price":228.0,"supplier":"MULTI TOOL"},{"code":"MU1-MARKERTA-2","description":"MARKER TAMPER CHECK ORANGE 30ML","price":228.0,"supplier":"MULTI TOOL"},{"code":"MU1-MARKERTA-3","description":"MARKER TAMPER CHECK RED 30ML","price":228.0,"supplier":"MULTI TOOL"},{"code":"054TSPRB16","description":"TAP M16X2.0 S/POINT RED BAND","price":1138.0,"supplier":"MULTI TOOL"},{"code":"109TD48X25BLU","description":"DUCT TAPE 48MM X 25 METER BLUE","price":78.0,"supplier":"MULTI TOOL"},{"code":"109MT80DX48X40","description":"MASKING TAPE 80DEG X 48MM X 40 METER","price":38.0,"supplier":"MULTI TOOL"},{"code":"097TPTFEW","description":"THREAD TAPE PTFE WHITE","price":8.0,"supplier":"MULTI TOOL"},{"code":"012BS1010","description":"BS1010 DE BURRING BLADE","price":41.0,"supplier":"MULTI TOOL"},{"code":"094CT02.5X100B","description":"2.5MM X 100 BLACK CABLE TIE","price":49.0,"supplier":"MULTI TOOL"},{"code":"094CT04.7X198B","description":"4.7MM X 198 BLACK CABLE TIE","price":82.0,"supplier":"MULTI TOOL"},{"code":"037SB01-921","description":"STANLEY BLADE H/D (1) O11-921","price":8.0,"supplier":"MULTI TOOL"},{"code":"075G9557HNG","description":"MAKITA GRINDER 9557HNG-115 IND. 840W","price":1325.0,"supplier":"MULTI TOOL"},{"code":"091GNCG","description":"GREASE NIPPLE CAP BLUE","price":6.5,"supplier":"MULTI TOOL"},{"code":"136GNSBSP1/8","description":"1/8\" BSP STRAIGHT GREASE NIPPLE","price":6.0,"supplier":"MULTI TOOL"},{"code":"1332528","description":"250ML SUNSHINE YELLOW FD SPRAY PAINT","price":82.0,"supplier":"MULTI TOOL"},{"code":"160PTR16AB","description":"PLUG TOP RUBBER 16A BLK","price":15.0,"supplier":"MULTI TOOL"},{"code":"160JCRB","description":"JANUS COUPLER RUBBER BLK","price":35.0,"supplier":"MULTI TOOL"},{"code":"054TSRB16","description":"TAP M16X2.0 S/POINT RED BAND","price":1138.0,"supplier":"MULTI TOOL"},{"code":"054TSRB08","description":"TAP M8X1.25 S/POINT RED BAND","price":396.0,"supplier":"MULTI TOOL"},{"code":"017CD115X1.00X22D","description":"CUTTING DISC 115X0.22 STEEL","price":12.0,"supplier":"MULTI TOOL"},{"code":"131PSC100063200","description":"10000MMX63MMX200UM PLASTIC CLEAR SHEET","price":1382.0,"supplier":"MULTI TOOL"},{"code":"MU1-CABTYRE2","description":"CABTYRE 2.5MM X 3 BLACK 50M","price":1650.0,"supplier":"MULTI TOOL"},{"code":"MU1-KTSOCKET","description":"K/T SOCKET /BIT SET 1.4\" DR4-13MM","price":1425.0,"supplier":"MULTI TOOL"},{"code":"MU1-RCLIP4X6","description":"R CLIP 4X60 SINGLE LOOP","price":26.0,"supplier":"MULTI TOOL"},{"code":"MU1-ALLENKEY","description":"ALLEN KEY 5MM KT L/S E/L","price":58.0,"supplier":"MULTI TOOL"},{"code":"MU1-INGCO6DR","description":"INGCO 6 DRAWER TOOL TROLLEY HTCS273561","price":12600.0,"supplier":"MULTI TOOL"},{"code":"MU1-WASHERCO","description":"WASHER COPPER M14","price":5.0,"supplier":"MULTI TOOL"},{"code":"MU1-WASH10FL","description":"WASH 10 FL 10X30X2 GALV","price":1.6,"supplier":"MULTI TOOL"},{"code":"MU1-REDREFLE","description":"RED REFLECTIVE TAPE","price":391.0,"supplier":"MULTI TOOL"},{"code":"130GFSGH827/1.4","description":"H-827/1.4MM GRAVITY FEED SPRAY GUN","price":582.0,"supplier":"MULTI TOOL"},{"code":"054TSPRB12","description":"TAP M12X1.75 S/POINT RED BAND","price":752.0,"supplier":"MULTI TOOL"},{"code":"052902062MR09","description":"TOOL BOX 62PC COMPLETE KT","price":4730.0,"supplier":"MULTI TOOL"},{"code":"MU1-M20HDWAS","description":"M20 H/D WASHER","price":4.0,"supplier":"MULTI TOOL"},{"code":"MU1-M20XLONG","description":"M20 X LONG SERIES SPIRAL POINT TAP 280MM","price":2340.0,"supplier":"MULTI TOOL"},{"code":"MU1-M8X1DIN3","description":"M8 X 1 DIN374 SPIRAL POINT TAP FERG","price":542.0,"supplier":"MULTI TOOL"},{"code":"148CD115X1,0X22","description":"CUTTING DISC 115X0.22 STEEL","price":28.0,"supplier":"MULTI TOOL"},{"code":"MU1-WASHERM2","description":"WASHER M20 THRU/HARD","price":4.0,"supplier":"MULTI TOOL"},{"code":"MU1-SETSCREW","description":"SET SCREWS 3/8 X 1\"","price":4.0,"supplier":"MULTI TOOL"},{"code":"MU1-8X70PINS","description":"8X70 PIN SPRING","price":10.0,"supplier":"MULTI TOOL"},{"code":"MU1-12X8MMRU","description":"1.2 X 8MM RUBBER SHEET","price":742.0,"supplier":"MULTI TOOL"},{"code":"065KEN5838828K","description":"38MMX3/4\"DR DEEP IMPACT SOCKET","price":440.0,"supplier":"MULTI TOOL"},{"code":"MU1-12BSWSTT","description":"1/2\" BSW S/T TAP HSS","price":402.0,"supplier":"MULTI TOOL"},{"code":"1332526","description":"250ML SIGNAL RED FD SPRAY PAINT","price":78.0,"supplier":"MULTI TOOL"},{"code":"110TN015L","description":"5 L TAPMATIC","price":892.0,"supplier":"MULTI TOOL"},{"code":"065KEN5606470K","description":"10MM LETTER STAMP SET","price":2842.0,"supplier":"MULTI TOOL"},{"code":"065KEN5606070K","description":"10MM NUMBER STAMP SET","price":1240.0,"supplier":"MULTI TOOL"},{"code":"071LEDSL7","description":"SL7 TORCH LED LENSES","price":924.0,"supplier":"MULTI TOOL"},{"code":"167PSE05","description":"5 LITRE PAINT TRIP ELARA","price":595.0,"supplier":"MULTI TOOL"},{"code":"136GN45BSP1/8","description":"1/8\"BSP 45' GREASE NIPPLE","price":6.0,"supplier":"MULTI TOOL"},{"code":"MU1-NINJAGLO","description":"NINJA GLOVES SIZE 10 BLACK","price":54.0,"supplier":"MULTI TOOL"},{"code":"MU1-DRILL22M","description":"DRILL 22MMX375X500MM MTS L/S","price":3218.0,"supplier":"MULTI TOOL"},{"code":"076GGOAT/12","description":"GLOVES ARGON TIG GOAT SKIN S12","price":45.0,"supplier":"MULTI TOOL"},{"code":"130MT80DX48X40","description":"MASKING RAPE 80DEG X 48MM X 40 METER","price":38.0,"supplier":"MULTI TOOL"},{"code":"053TC4-34","description":"1.5KG X 68MM FACE DEAD BLOW HAMMER","price":1652.0,"supplier":"MULTI TOOL"},{"code":"114DMFFP3VAL20","description":"DUST MASK FFP3(20PC) WITH VALVE","price":200.0,"supplier":"MULTI TOOL"},{"code":"018HSB18BME","description":"HACKSAW BLADE 18TPI BI METAL ECLIPSE","price":35.0,"supplier":"MULTI TOOL"},{"code":"065KBE2592500K","description":"BLOW GUN KOBE","price":200.0,"supplier":"MULTI TOOL"},{"code":"065KEN5886060K","description":"MULTI PURPOSE 4 WAY KEY","price":118.0,"supplier":"MULTI TOOL"},{"code":"MU1-1KGMOLYK","description":"1KG MOLYKOTE 1000","price":2015.0,"supplier":"MULTI TOOL"},{"code":"054TSRB10","description":"TAP M10X1.5 S/POINT RED BAND","price":428.0,"supplier":"MULTI TOOL"},{"code":"MU1-BUBBLEWR","description":"BUBBLE WRAP 1.25MX80M","price":428.0,"supplier":"MULTI TOOL"},{"code":"MU1-NOZZLE24","description":"NOZZLE 24CT . TWC NO. 4","price":74.0,"supplier":"MULTI TOOL"},{"code":"0526146-08A","description":"200MM CABLE CUTTING PLIER VDE 1000V","price":576.0,"supplier":"MULTI TOOL"},{"code":"025GRR500G","description":"500G RED RUBBER GREASE HER","price":160.0,"supplier":"MULTI TOOL"},{"code":"134SAG10X130","description":"M10X130 EN8 ANCHOR STUD/NUT/WASHER","price":36.0,"supplier":"MULTI TOOL"},{"code":"MU1-14DRIVES","description":"1/4\" DRIVE SOCKET SET 4-14MM 46PC CHROME","price":3422.0,"supplier":"MULTI TOOL"},{"code":"MU1-MECHANIC","description":"MECHANIC CREEPER WHEEL AND PLASTIC","price":982.0,"supplier":"MULTI TOOL"},{"code":"0113P550445","description":"HYDRAULIC FILTER SPIN ON","price":1347.59,"supplier":"OHR&LOGISTICS"},{"code":"CON05","description":"AIR RUBBER INTAKE SEAL","price":41.5,"supplier":"OHR&LOGISTICS"},{"code":"443776W-995-481865","description":"443776W-995-481865C2","price":2593.33,"supplier":"PARKER STORE"},{"code":"2361B/020","description":"SAFETY VALVE 8 BAR BRASS","price":2453.86,"supplier":"PARKER STORE"},{"code":"PO-06000DN4","description":"PROFILE 2.5MM YEL (40M/REEL)","price":3061.4,"supplier":"PARTEX"},{"code":"PHZF20032DN","description":"HEAT SHRINK FLAT 3.2 YELL R/25M","price":1532.65,"supplier":"PARTEX"},{"code":"HS264CLEAR","description":"HEATSHRINK PARTEX CLEAR 6.4MM","price":348.08,"supplier":"PARTEX"},{"code":"AF-770-20","description":"SYNTOL SB","price":1726.4,"supplier":"PETROMARK"},{"code":"XI-500-20","description":"ILLUMINATING PARAFFIN","price":1085.0,"supplier":"PETROMARK"},{"code":"NS-H05-18","description":"PETROGRIT","price":1284.3,"supplier":"PETROMARK"},{"code":"XI-500-200","description":"ILLUMINATING PARAFFIN","price":8906.04,"supplier":"PETROMARK"},{"code":"SA-DISPPGAURD100-M","description":"COVERALL REBEL PROGAURD100 DISPOSABLE WHITE SIZE M","price":41.95,"supplier":"PROTEKTA"},{"code":"SA-DISPPGAURD100-L","description":"COVERALL REBEL PROGAURD100 DISPOSABLE WHITE SIZE L","price":41.95,"supplier":"PROTEKTA"},{"code":"3044513","description":"UT2,5-TWIN","price":23.95,"supplier":"PXC"},{"code":"320459","description":"CLS-40 WATER LEVEL SENSOR","price":2233.0,"supplier":"RADEL"},{"code":"NIP-06OR06R","description":"NIPPLE 11/16 ORFS X 3/8 BSP","price":13.5,"supplier":"RAND BUILDING"},{"code":"IMO-1CEB30N27S5","description":"OVERCENTRE CARTRIDGE","price":2485.08,"supplier":"RAND BUILDING"},{"code":"ODZJ-001","description":"SAFETY VALVE WITH TEF SEAT 3/4\"","price":4302.0,"supplier":"ROLYN ENGINEERING"},{"code":"ODZJ-002","description":"SAFETY VALVE WITH 3/4\" BRONZE S10L","price":1662.0,"supplier":"ROLYN ENGINEERING"},{"code":"R3B63G14N250BAR","description":"R 3 B 63 G 14N 250 BAR","price":650.0,"supplier":"SA GAUGE"},{"code":"R3A63G14B10BAR","description":"R 3 A 63 G 14B 10 BAR","price":650.0,"supplier":"SA GAUGE"},{"code":"R3A63G14B25BAR","description":"R 3 A 63 G 14B 25 BAR","price":650.0,"supplier":"SA GAUGE"},{"code":"R3A63G14B250BAR","description":"R 3 A 63 G 14B 250 BAR","price":650.0,"supplier":"SA GAUGE"},{"code":"NSS","description":"0.50MM STAINLESS STEEL S304 ARC SHIM 85.5MMX150MM","price":33.0,"supplier":"SHIM STOCK"},{"code":"EVE024-ZA","description":"SHROUD, STRAIGHT, ESCO, DRG: T5-06","price":7377.0,"supplier":"SPEC-CAST WEAR PARTS"},{"code":"EVEN025-ZA","description":"SHROUD, RH, ESCO, 24R, DRG: T5-05","price":7521.0,"supplier":"SPEC-CAST WEAR PARTS"},{"code":"EVEN026-ZA","description":"SHROUD, LH, ESCO, 24L, DRG: T5-04","price":7521.0,"supplier":"SPEC-CAST WEAR PARTS"},{"code":"EVEN027-ZA","description":"SHROUD, CORNER, ESCO L/H, DRG: T5-16","price":14970.0,"supplier":"SPEC-CAST WEAR PARTS"},{"code":"EVEN028-ZA","description":"SHROUD, CORNER, ESCO, R/H, DRG: T5-03.1","price":14970.0,"supplier":"SPEC-CAST WEAR PARTS"},{"code":"HSC175-55","description":"HEEL SHROUD, W175XTH55MM (HB155-235)","price":927.0,"supplier":"SPEC-CAST WEAR PARTS"},{"code":"35231","description":"RAGS 5KG","price":104.35,"supplier":"STEELMATE"},{"code":"6304909","description":"LPKU 140708 PNR-M","price":409.0,"supplier":"TAEGUTEC"},{"code":"TAE-4300556S","description":"4300556 SST 32","price":78.0,"supplier":"TAEGUTEC"},{"code":"TAE-99103763","description":"9910376 3MM S/C M/FL 3/MILL L/S","price":494.3,"supplier":"TAEGUTEC"},{"code":"TAE-6001119T","description":"6001119 TSC 2","price":210.0,"supplier":"TAEGUTEC"},{"code":"TAE-32029301","description":"3202930 160-169-20T3-8D","price":7989.0,"supplier":"TAEGUTEC"},{"code":"9998261","description":"3X105X155 UDL E/L DRILL","price":185.0,"supplier":"TAEGUTEC"},{"code":"6169712","description":"4NKT 090408R-M","price":351.0,"supplier":"TAEGUTEC"},{"code":"6236052","description":"DNMG 130508 PC","price":234.0,"supplier":"TAEGUTEC"},{"code":"4207265","description":"TCD-102-P","price":1658.0,"supplier":"TAEGUTEC"},{"code":"4350834","description":"SO 50090S","price":78.0,"supplier":"TAEGUTEC"},{"code":"4206982","description":"TCD-140-P","price":1729.0,"supplier":"TAEGUTEC"},{"code":"6306322","description":"DNMG 150608 MGP","price":311.0,"supplier":"TAEGUTEC"},{"code":"6000998","description":"TDC 2","price":430.0,"supplier":"TAEGUTEC"},{"code":"6000999","description":"TDC 3","price":430.0,"supplier":"TAEGUTEC"},{"code":"6400367","description":"TDIT 4.00E-2.00","price":622.0,"supplier":"TAEGUTEC"},{"code":"TX1625","description":"1625-CSB 20 BUSHES","price":24.8,"supplier":"TECHNOSLIDE"},{"code":"8JM14MM","description":"3/4 JIC MALE X 14MM ADP","price":19.79,"supplier":"THC"},{"code":"1680211","description":"90 JIC MALE-FEMALE ELBOW","price":20.49,"supplier":"THC"},{"code":"1680274","description":"90 JIC MALE-FEMALE ELBOW","price":26.82,"supplier":"THC"},{"code":"FF2408-08","description":"13/16\"16 ORFS PLUG","price":17.21,"supplier":"THC"},{"code":"FF304C-08","description":"13/16\"-16 ORFS FEMALE CAP","price":21.17,"supplier":"THC"},{"code":"FF304C-12","description":"1 3/16\"-12 ORFS FEMALE CAP","price":43.2,"supplier":"THC"},{"code":"5000-24-24","description":"1 1/2\" NPTF PIPE COUPLING","price":181.14,"supplier":"THC"},{"code":"5000-32-32","description":"2\" NPTF PIPE COUPLING","price":264.31,"supplier":"THC"},{"code":"14X2","description":"14X2 STEEL TUBE","price":56.26,"supplier":"THC"},{"code":"6500-04-04","description":"90 JIC MALE-FEMALE ELBOW","price":20.49,"supplier":"THC"},{"code":"6500-06-06","description":"90 JIC MALE-FEMALE ELBOW","price":26.82,"supplier":"THC"},{"code":"6500-08-08","description":"90 JIC MALE-FEMALE ELBOW","price":31.45,"supplier":"THC"},{"code":"6500-12-12","description":"90 JIC MALE-FEMALE ELBOW","price":60.68,"supplier":"THC"},{"code":"2406-12-08","description":"JIC REDUCER","price":36.31,"supplier":"THC"},{"code":"2406-12-06","description":"JIC REDUCER","price":36.06,"supplier":"THC"},{"code":"6502-06-06","description":"9/16 45 JIC MALE/FEMALE ELBOW","price":31.8,"supplier":"THC"},{"code":"6400-16-12","description":"JIC SAE O RING BOSS STRAIGHT","price":46.29,"supplier":"THC"},{"code":"MCJB-12-16","description":"JIC/BSP MALE ADAPTOR","price":52.13,"supplier":"THC"},{"code":"DW-24","description":"1 1/2\" BSP SELF CENTERING DOWTY WASHER","price":13.55,"supplier":"THC"},{"code":"MCJB-24-24","description":"JIC/BSP MALE ADAPTOR","price":112.7,"supplier":"THC"},{"code":"MCJB-06-06","description":"JIC/BSP MALE ADAPTOR","price":11.68,"supplier":"THC"},{"code":"MCJB-16-16","description":"JIC/BSP MALE ADAPTOR","price":46.76,"supplier":"THC"},{"code":"VSTI1/2ED","description":"LOCKING COMPONENTS","price":26.24,"supplier":"THC"},{"code":"VSTI3/8ED","description":"LOCKING COMPONENTS","price":18.74,"supplier":"THC"},{"code":"DW-06","description":"3/8\" BSP SELF CENTERING DOWTY WASHER","price":2.38,"supplier":"THC"},{"code":"6602-06-06-06","description":"9/16 SWIVEL NUT RUN TEE JIC","price":39.98,"supplier":"THC"},{"code":"MCJB-04-04","description":"JIC/BSP MALE ADAPTOR","price":10.74,"supplier":"THC"},{"code":"MCJB-06-08","description":"JIC/BSP MALE ADAPTOR","price":16.97,"supplier":"THC"},{"code":"DW-04","description":"1/4\" BSP SELF CENTERING DOWTY WASHER","price":2.31,"supplier":"THC"},{"code":"MCJB-08-08","description":"JIC/BSP MALE ADAPTOR","price":18.87,"supplier":"THC"},{"code":"C40XS-04-04","description":"JIC/BSP 90 ELBOW","price":36.54,"supplier":"THC"},{"code":"MCJB-08-06","description":"JIC/BSP MALE ADAPTOR","price":14.28,"supplier":"THC"},{"code":"VESTI1/4ED","description":"LOCKING COMPONENTS","price":16.07,"supplier":"THC"},{"code":"VESTI1/8ED","description":"LOCKING COMPONENTS","price":14.69,"supplier":"THC"},{"code":"MCJB-20-20","description":"JIC/BSP MALE ADAPTOR","price":119.55,"supplier":"THC"},{"code":"MCJB-24-20","description":"JIC/BSP MALE ADAPTOR","price":119.55,"supplier":"THC"},{"code":"MCJB-16-20","description":"JIC/BSP MALE ADAPTOR","price":95.71,"supplier":"THC"},{"code":"MCJB-12-20","description":"JIC/BSP MALE ADAPTOR","price":108.02,"supplier":"THC"},{"code":"2403-06-06","description":"MALE JIC STRAIGHT","price":7.92,"supplier":"THC"},{"code":"2403-12-12","description":"MALE JIC STRAIGHT","price":21.16,"supplier":"THC"},{"code":"2403-08-08","description":"MALE JIC STRAIGHT","price":11.52,"supplier":"THC"},{"code":"2408-06","description":"JIC MALE PLUG","price":6.55,"supplier":"THC"},{"code":"2408-08","description":"JIC MALE PLUG","price":8.44,"supplier":"THC"},{"code":"2408-12","description":"JIC MALE PLUG","price":12.03,"supplier":"THC"},{"code":"6500-24-24","description":"90 JIC MALE-FEMALE ELBOW","price":309.92,"supplier":"THC"},{"code":"68-0304","description":"COMPRESSION FITTING","price":11.36,"supplier":"THC"},{"code":"MCJB-12-08","description":"JIC/BSP MALE ADAPTOR","price":27.71,"supplier":"THC"},{"code":"MCJB-08-12","description":"JIC/BSP MALE ADAPTOR","price":29.21,"supplier":"THC"},{"code":"8JM18MM","description":"3/4 JIC MALE X 14MM ADP","price":19.76,"supplier":"THC"},{"code":"4JM14MM","description":"7/16 JIC MALE X 14MM ADP","price":14.28,"supplier":"THC"},{"code":"6JM14MM","description":"9/16 JIC MALE X 14MM ADP","price":18.39,"supplier":"THC"},{"code":"DW-08","description":"1/2\" BSP SELF CENTERING DOWTY WASHER","price":3.14,"supplier":"THC"},{"code":"DW-12","description":"3/4\" BSP SELF CENTERING DOWTY WASHER","price":3.96,"supplier":"THC"},{"code":"MCJB-12-12","description":"JIC/BSP MALE ADAPTOR","price":27.67,"supplier":"THC"},{"code":"MCJB-16-12","description":"JIC/BSP MALE ADAPTOR","price":42.4,"supplier":"THC"},{"code":"2403-16-16","description":"MALE JIC STRAIGHT","price":37.07,"supplier":"THC"},{"code":"6504-06-06","description":"9/16 JIC M X JIC F STR SW","price":27.28,"supplier":"THC"},{"code":"2700-04-04","description":"JIC BULKHEAD STRAIGHT","price":18.21,"supplier":"THC"},{"code":"2701-04-04","description":"90 JIC BULKHEAD","price":26.23,"supplier":"THC"},{"code":"ROPMANKG00012","description":"12MM MANILLA ROPE","price":239.0,"supplier":"TOCO LIFTING"},{"code":"0/261469","description":"ANM1.6-TAURUS ANM 1.6 CUTTING NOZZLE 1/16","price":88.75,"supplier":"TOOL CENTRE"},{"code":"0/261470","description":"ANM1.2-TAURUS ANM 1.2 CUTTING NOZZLE 3/64","price":88.75,"supplier":"TOOL CENTRE"},{"code":"EVE/AQUA-S O","description":"DTM AQUA SANDVIK ORANGE 4.5LT","price":1570.0,"supplier":"TOOL CENTRE"},{"code":"EVE/AQUA-D G","description":"DTM AQUA DARK GREA 4.5LT","price":1610.0,"supplier":"TOOL CENTRE"},{"code":"PCMQDE/SO-20 LT","description":"PCM QD ENAMLE SANDVIK ORANGE","price":2093.79,"supplier":"TOOL CENTRE"},{"code":"T/LATCHI-25LT LT","description":"LACQUER THINNERS GRADE-A 25LT - TAG","price":28.41,"supplier":"TOOL CENTRE"},{"code":"SAF000708","description":"GLOVES NINJA FLEX - 04L GLOVES LATEX","price":47.35,"supplier":"TOOL CENTRE"},{"code":"EVE-AQUA-S 0","description":"DTM AQUA SANDVIK ORANGE 4.5LT","price":1570.0,"supplier":"TOOL CENTRE"},{"code":"EVE/AQUA-E Y","description":"DTM AQUA EPIROC YELLOW 4.5LT","price":2050.0,"supplier":"TOOL CENTRE"},{"code":"EVE/AQUA-S W","description":"DTM AQUA STRAIGHT WHITE 4.5LT","price":1430.0,"supplier":"TOOL CENTRE"},{"code":"PCMQDE/EY-20","description":"PCM QD ENAMEL EPIROC YELLOW 20LT","price":1717.09,"supplier":"TOOL CENTRE"},{"code":"PCMQDE/WHI-2","description":"QD ENAMEL WHITE 20 LT","price":1651.4,"supplier":"TOOL CENTRE"},{"code":"T/QDT-25LT","description":"QD ENAMEL THINNERS 25LT - TAG","price":37.2,"supplier":"TOOL CENTRE"},{"code":"PCMQDE/DAG-2","description":"PCM QD EMAEL DARK AD GREY","price":1619.26,"supplier":"TOOL CENTRE"},{"code":"C/250215","description":"PISTON RING","price":199.29,"supplier":"TRAMAX"},{"code":"C/235283","description":"GASKET-85203349","price":148.71,"supplier":"TRAMAX"},{"code":"C/4205154","description":"GASKET-0491267","price":235.61,"supplier":"TRAMAX"},{"code":"C/4205272","description":"GASKET-5600595","price":72.45,"supplier":"TRAMAX"},{"code":"C/60K40328","description":"O-RING-04699651","price":107.03,"supplier":"TRAMAX"},{"code":"C/4205101","description":"GASKET-04691385","price":250.35,"supplier":"TRAMAX"},{"code":"C/241077","description":"SPRING","price":256.38,"supplier":"TRAMAX"},{"code":"C/241699","description":"SPRING","price":325.37,"supplier":"TRAMAX"},{"code":"C/246291","description":"COIL","price":1620.36,"supplier":"TRAMAX"},{"code":"TPAFS10/BL/100M","description":"10MM (NW7.5) NYLON CONDUIT BLACK V2","price":2150.0,"supplier":"TTS"},{"code":"TPS161012","description":"T PIECE 16X10X12","price":39.5,"supplier":"TTS"},{"code":"TPS101010","description":"T PIECE 10X10X10","price":35.9,"supplier":"TTS"},{"code":"YPS202012","description":"Y PIECE 20X20X12","price":42.9,"supplier":"TTS"},{"code":"YPS121212/BL","description":"Y PIECE 12X12X12","price":39.5,"supplier":"TTS"},{"code":"TGZ13","description":"ENC CAP RUBBER SLEEVE BLACK 13MM","price":27.26,"supplier":"TTS"},{"code":"TGZ21","description":"ENC CAP RUBBER SLEEVE BLACK 21MM","price":36.92,"supplier":"TTS"},{"code":"NC10/100M","description":"10MM NYLON CONDUIT","price":2541.87,"supplier":"TTS"},{"code":"NC12/BL/100M","description":"12MM NYLON CONDUIT","price":2618.66,"supplier":"TTS"},{"code":"FG-EVE003-014","description":"COMPRESSION SPRING","price":97.37,"supplier":"WEBLOR SPRINGS"},{"code":"W5382-4577","description":"SHANK LUBE 4L 3115312502","price":1768.88,"supplier":"WECO"}]};

/* ---- THREE COMPLETE DESIGN SYSTEMS ---- */
const THEMES = {
  ledger: {
    name: "Engineering Ledger", blurb: "Light · precise · blueprint", mode: "light",
    bg: "#e9eef3", surface: "#ffffff", surface2: "#f4f7fa", sunk: "#e4ebf1",
    ink: "#14202e", ink2: "#42505f", faint: "#8294a6", line: "#bfccda", line2: "#dae3ec",
    accent: "#1c4e80", accentInk: "#ffffff", accentSoft: "#e2ecf7",
    ok: "#1f7a4d", warn: "#9a6a14", bad: "#a8362b", info: "#1c4e80", cool: "#54489a",
    radius: 0, radiusSm: 0,
    display: '"Saira Semi Condensed", "Arial Narrow", sans-serif',
    body: '"Inter", system-ui, sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace',
    shadow: "0 1px 0 rgba(20,32,46,.05)",
    grid: "linear-gradient(rgba(28,78,128,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(28,78,128,.045) 1px, transparent 1px)",
    gridSize: "23px 23px", sig: "titleblock",
  },
  console: {
    name: "Industrial Console", blurb: "Dark · mechanical · instrument panel", mode: "dark",
    bg: "#0c0f12", surface: "#13181d", surface2: "#1a2127", sunk: "#080b0e",
    ink: "#e6edf3", ink2: "#9fb0bf", faint: "#5f6e7b", line: "#232c35", line2: "#323d48",
    accent: "#ff7a1a", accentInk: "#140a02", accentSoft: "rgba(255,122,26,.13)",
    ok: "#36d399", warn: "#fbbf24", bad: "#f87272", info: "#56b6e6", cool: "#a78bfa",
    radius: 4, radiusSm: 3,
    display: '"Oswald", "Arial Narrow", sans-serif',
    body: '"Inter", system-ui, sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace',
    shadow: "0 8px 28px rgba(0,0,0,.5)", grid: "none", gridSize: "0", sig: "instrument",
  },
  workshop: {
    name: "Refined Workshop", blurb: "Warm · editorial · premium trade", mode: "light",
    bg: "#f1eadf", surface: "#fbf8f2", surface2: "#efe7d9", sunk: "#eae0d0",
    ink: "#2b2018", ink2: "#5c4d40", faint: "#9a8975", line: "#d6c8b2", line2: "#e7ddcc",
    accent: "#7c2d2d", accentInk: "#fbf8f2", accentSoft: "#f0e0db",
    ok: "#4a6b3a", warn: "#9a6a1e", bad: "#9c3026", info: "#5a6b7c", cool: "#6b5a8c", brass: "#b08738",
    radius: 9, radiusSm: 6,
    display: '"Fraunces", Georgia, serif',
    body: '"Inter", system-ui, sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace',
    shadow: "0 10px 30px rgba(43,32,24,.10)", grid: "none", gridSize: "0", sig: "editorial",
  },
};
const THEME_KEYS = Object.keys(THEMES);
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Oswald:wght@400;500;600;700&family=Saira+Semi+Condensed:wght@500;600;700&display=swap";

const NS = "procure:";
const store = {
  async get(k, def) { try { const v = localStorage.getItem(NS + k); return v != null ? JSON.parse(v) : def; } catch { return def; } },
  async set(k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch {} return true; },
  async del(k) { try { localStorage.removeItem(NS + k); } catch {} },
};
const SEED_USERS = [
  { id: "u-admin", name: "Stefan Kruger", email: "admin@demo.com", password: "admin", role: "Admin" },
  { id: "u-req", name: "Req User", email: "requester@demo.com", password: "req", role: "Requester" },
  { id: "u-gm", name: "GM User", email: "gm@demo.com", password: "gm", role: "GM" },
  { id: "u-fin", name: "Finance User", email: "finance@demo.com", password: "fin", role: "Finance" },
];
const money = (n) => "R\u2009" + Number(n || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (s) => { if (!s) return ""; const d = new Date(s); return d.toLocaleDateString("en-ZA", { day: "2-digit", month: "short" }) + " · " + d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }); };
const initials = (n) => (n || "?").split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

async function fetchJSON(url, opts = {}, timeoutMs = 7000) {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal }); clearTimeout(t);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text(); if (!text) throw new Error("empty");
    return JSON.parse(text);
  } catch (e) { clearTimeout(t); throw e; }
}

export default function App() {
  const [booted, setBooted] = useState(false);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [themeKey, setThemeKey] = useState("ledger");
  const [toast, setToast] = useState(null);
  const T = useMemo(() => THEMES[themeKey] || THEMES.ledger, [themeKey]);

  const showToast = useCallback((msg, kind = "ok") => {
    const id = Date.now(); setToast({ msg, kind, id });
    setTimeout(() => setToast((t) => (t && t.id === id ? null : t)), 3400);
  }, []);

  useEffect(() => {
    if (!document.getElementById("procure-fonts")) {
      const l = document.createElement("link"); l.id = "procure-fonts"; l.rel = "stylesheet"; l.href = FONT_LINK; document.head.appendChild(l);
    }
    (async () => {
      let us = await store.get("users", null);
      if (!us) { us = SEED_USERS; await store.set("users", us); }
      setUsers(us);
      const sess = await store.get("session", null);
      if (sess && sess.id) { setUser(sess); }
      const tk = await store.get("themeKey", "ledger");
      setThemeKey(THEME_KEYS.includes(tk) ? tk : "ledger");
      setBooted(true);
    })();
  }, []);

  const setTheme = useCallback((k) => { setThemeKey(k); store.set("themeKey", k); }, []);
  const login = useCallback(async (email, password) => {
    email = email.trim().toLowerCase();
    try {
      const r = await fetchJSON(EP.auth, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "login", email, password }) });
      if (r.ok && r.user) {
        const u = { id: r.user.id, name: r.user.name, email: r.user.email, role: r.user.role };
        setUser(u); await store.set("session", u);
        setUsers((prev) => { const n = prev.some((x) => x.id === u.id) ? prev : [...prev, u]; store.set("users", n); return n; });
        return { ok: true };
      }
      if (r.ok === false) return { ok: false, error: r.error || "Invalid credentials" };
    } catch {}
    const u = users.find((x) => x.email.toLowerCase() === email && x.password === password);
    if (u) { setUser(u); await store.set("session", u); return { ok: true }; }
    return { ok: false, error: "Those details don't match an account." };
  }, [users]);
  const register = useCallback(async (name, email, password, role) => {
    email = email.trim().toLowerCase();
    if (users.some((x) => x.email.toLowerCase() === email)) return { ok: false, error: "That email is already registered." };
    const u = { id: "u-" + Math.random().toString(36).slice(2, 9), name, email, password, role };
    try { const r = await fetchJSON(EP.auth, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "register", name, email, password, role }) }); if (r.ok && r.user?.id) u.id = r.user.id; } catch {}
    const next = [...users, u]; setUsers(next); await store.set("users", next); return { ok: true };
  }, [users]);
  const logout = useCallback(async () => { setUser(null); await store.del("session"); }, []);
  const updateUser = useCallback(async (patch) => {
    setUser((u) => { const nu = { ...u, ...patch }; store.set("session", nu); return nu; });
    setUsers((prev) => { const n = prev.map((x) => (x.id === user.id ? { ...x, ...patch } : x)); store.set("users", n); return n; });
  }, [user]);

  if (!booted) return <div style={{ minHeight: "100vh", background: "#e9eef3" }} />;
  if (!user) return <AuthScreen onLogin={login} onRegister={register} T={T} themeKey={themeKey} setTheme={setTheme} />;
  return <Shell T={T} themeKey={themeKey} setTheme={setTheme} user={user} users={users} setUsers={setUsers}
    onLogout={logout} onUpdateUser={updateUser} toast={toast} showToast={showToast} />;
}

/* =========================================================================
   THEME-AWARE PRIMITIVES — every component reads from T (tokens).
   The per-theme "signature" lives in Panel + SectionLabel + StatusDot.
   ========================================================================= */
function Panel({ T, children, stamp, style, ...p }) {
  // ledger: titleblock frame w/ corner stamp · console: machined card · workshop: soft editorial card
  const base = {
    background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.radius,
    boxShadow: T.shadow, position: "relative",
  };
  const skin = T.sig === "instrument"
    ? { ...base, background: `linear-gradient(180deg, ${T.surface2}, ${T.surface})`, borderColor: T.line2 }
    : T.sig === "editorial"
    ? { ...base }
    : { ...base }; // titleblock
  return (
    <div style={{ ...skin, ...style }} {...p}>
      {T.sig === "titleblock" && stamp && (
        <div style={{ position: "absolute", top: 0, right: 0, borderLeft: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`,
          padding: "3px 8px", fontFamily: T.mono, fontSize: 9.5, letterSpacing: ".1em", color: T.faint, textTransform: "uppercase" }}>{stamp}</div>
      )}
      {children}
    </div>
  );
}

function SectionLabel({ T, children, n }) {
  if (T.sig === "editorial") {
    return (
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
        {n && <span style={{ fontFamily: T.display, fontSize: 26, fontWeight: 600, color: T.brass, lineHeight: 1 }}>{n}</span>}
        <h3 style={{ fontFamily: T.display, fontSize: 19, fontWeight: 600, color: T.ink, margin: 0, letterSpacing: "-.01em" }}>{children}</h3>
        <div style={{ flex: 1, height: 1, background: T.accent, opacity: .5 }} />
      </div>
    );
  }
  if (T.sig === "instrument") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <span style={{ width: 5, height: 13, background: T.accent, borderRadius: 1 }} />
        <h3 style={{ fontFamily: T.display, fontSize: 13, fontWeight: 600, color: T.ink2, margin: 0, letterSpacing: ".14em", textTransform: "uppercase" }}>{children}</h3>
      </div>
    );
  }
  // titleblock — drafting label with rule + tick
  return (
    <div style={{ marginBottom: 14 }}>
      <h3 style={{ fontFamily: T.display, fontSize: 13, fontWeight: 700, color: T.ink, margin: "0 0 6px", letterSpacing: ".12em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
        {n && <span style={{ fontFamily: T.mono, fontSize: 10, color: T.accent, border: `1px solid ${T.line}`, padding: "1px 5px" }}>{n}</span>}
        {children}
      </h3>
      <div style={{ height: 2, background: T.ink, width: 28 }} />
    </div>
  );
}

/* status vocabulary — rendered as theme-appropriate indicators */
const STATUS = {
  "Quote Requested": { key: "faint", label: "Awaiting quote" },
  "Quote Received": { key: "info", label: "Quote in" },
  "Pending Approval": { key: "warn", label: "Pending approval" },
  "Approved": { key: "ok", label: "Approved" },
  "Awaiting Delivery": { key: "cool", label: "Awaiting delivery" },
  "Rejected": { key: "bad", label: "Rejected" },
  "Delivered": { key: "ok", label: "Delivered" },
};
function StatusTag({ T, status }) {
  const m = STATUS[status] || { key: "faint", label: status };
  const c = T[m.key] || T.faint;
  if (T.sig === "instrument") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.display, fontSize: 11, fontWeight: 500, letterSpacing: ".08em", textTransform: "uppercase", color: c }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, boxShadow: `0 0 7px ${c}` }} />{m.label}
      </span>
    );
  }
  if (T.sig === "editorial") {
    return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: c }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />{m.label}</span>;
  }
  // titleblock — boxed engineering tag
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 10.5, fontWeight: 500, letterSpacing: ".04em", color: c, border: `1px solid ${c}`, padding: "2px 7px", textTransform: "uppercase" }}>
      <span style={{ width: 5, height: 5, background: c }} />{m.label}
    </span>
  );
}

function Btn({ T, children, kind = "ghost", style, ...p }) {
  const map = {
    primary: { background: T.accent, color: T.accentInk, border: `1px solid ${T.accent}` },
    ok: { background: T.ok, color: T.mode === "dark" ? "#06140d" : "#fff", border: `1px solid ${T.ok}` },
    bad: { background: "transparent", color: T.bad, border: `1px solid ${T.line2}` },
    ghost: { background: T.surface2, color: T.ink, border: `1px solid ${T.line2}` },
  }[kind];
  const radius = kind ? T.radiusSm : T.radiusSm;
  const fam = T.sig === "instrument" ? T.display : T.body;
  const extra = T.sig === "instrument" ? { textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600 } : { fontWeight: 600 };
  return <button {...p} style={{ padding: "9px 15px", borderRadius: radius, fontSize: 13, cursor: p.disabled ? "default" : "pointer", opacity: p.disabled ? .5 : 1, fontFamily: fam, ...extra, ...map, ...style }}>{children}</button>;
}

function Input({ T, style, ...p }) {
  return <input {...p} style={{ width: "100%", background: T.surface, border: `1px solid ${T.line2}`, color: T.ink, borderRadius: T.radiusSm, padding: "10px 12px", fontSize: 14, fontFamily: T.body, outline: "none", boxSizing: "border-box", ...style }}
    onFocus={(e) => { e.target.style.borderColor = T.accent; p.onFocus?.(e); }}
    onBlur={(e) => { e.target.style.borderColor = T.line2; p.onBlur?.(e); }} />;
}
function Select({ T, style, children, ...p }) {
  return <select {...p} style={{ width: "100%", background: T.surface, border: `1px solid ${T.line2}`, color: T.ink, borderRadius: T.radiusSm, padding: "10px 12px", fontSize: 14, fontFamily: T.body, outline: "none", boxSizing: "border-box", ...style }}>{children}</select>;
}
function FieldLabel({ T, children }) {
  return <span style={{ fontFamily: T.sig === "editorial" ? T.body : T.body, fontSize: 11, color: T.faint, textTransform: "uppercase", letterSpacing: ".07em", fontWeight: 600, display: "block", marginBottom: 6 }}>{children}</span>;
}
function Empty({ T, text }) {
  return <div style={{ padding: "36px 16px", textAlign: "center", color: T.faint, fontSize: 13.5, fontFamily: T.body }}>{text}</div>;
}

/* =========================================================================
   AUTH SCREEN — the strongest expression of each theme's identity
   ========================================================================= */
function AuthScreen({ onLogin, onRegister, T, themeKey, setTheme }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [name, setName] = useState(""); const [role, setRole] = useState("Requester");
  const [showPw, setShowPw] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr(""); setBusy(true);
    if (mode === "login") { const r = await onLogin(email, password); if (!r.ok) setErr(r.error); }
    else {
      if (!name.trim() || !email.trim() || !password) { setErr("Fill in every field to create your account."); setBusy(false); return; }
      const r = await onRegister(name, email, password, role);
      if (!r.ok) setErr(r.error); else { const lr = await onLogin(email, password); if (!lr.ok) setErr(lr.error); }
    }
    setBusy(false);
  };

  const isInstrument = T.sig === "instrument", isEditorial = T.sig === "editorial", isBlock = T.sig === "titleblock";

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.ink, fontFamily: T.body, display: "grid", gridTemplateColumns: "1.05fr .95fr" }}>
      {/* LEFT — brand canvas, distinct per theme */}
      <div style={{ position: "relative", overflow: "hidden", borderRight: `1px solid ${T.line}`, padding: "54px 58px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        background: isInstrument ? `radial-gradient(900px 420px at -5% -10%, ${T.accentSoft}, transparent 60%), linear-gradient(165deg, ${T.surface}, ${T.bg})`
          : isEditorial ? `linear-gradient(160deg, ${T.surface2}, ${T.bg})`
          : T.surface,
        backgroundImage: isBlock ? T.grid : undefined, backgroundSize: isBlock ? T.gridSize : undefined }}>

        {/* logo lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 13, position: "relative", zIndex: 2 }}>
          <Logo T={T} size={44} />
          <div>
            <div style={{ fontFamily: T.display, fontWeight: isEditorial ? 600 : 700, fontSize: isEditorial ? 21 : 17, letterSpacing: isEditorial ? "-.01em" : ".02em" }}>Procure</div>
            <div style={{ fontSize: 10.5, color: T.faint, fontFamily: T.mono, letterSpacing: ".18em" }}>OPERATIONS&nbsp;HUB</div>
          </div>
        </div>

        {/* hero — each theme frames its thesis differently */}
        <div style={{ maxWidth: 460, position: "relative", zIndex: 2 }}>
          {isBlock && <div style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, letterSpacing: ".18em", marginBottom: 18 }}>DOC&nbsp;·&nbsp;PROCUREMENT&nbsp;CONTROL&nbsp;·&nbsp;REV&nbsp;1</div>}
          {isEditorial && <div style={{ fontFamily: T.body, fontSize: 12, color: T.brass, letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 18 }}>Procurement, considered</div>}
          {isInstrument && <div style={{ fontFamily: T.display, fontSize: 12, color: T.accent, letterSpacing: ".26em", textTransform: "uppercase", marginBottom: 18 }}>System Online</div>}
          <h1 style={{ fontFamily: T.display, fontSize: isEditorial ? 46 : 42, lineHeight: 1.05, margin: "0 0 18px", fontWeight: isEditorial ? 600 : 700, letterSpacing: isEditorial ? "-.02em" : isBlock ? "-.01em" : "0" }}>
            {isEditorial ? <>The whole purchasing pipeline, in one considered place.</>
              : isInstrument ? <>RUN THE WHOLE PURCHASING PIPELINE FROM ONE PANEL.</>
              : <>One controlled record for the whole purchasing pipeline.</>}
          </h1>
          <p style={{ color: T.ink2, fontSize: 15, lineHeight: 1.6, margin: 0, maxWidth: 400 }}>
            Request parts, gather supplier quotes, route approvals, and track delivery — your team, your suppliers, your spend, held in one place.
          </p>
          <div style={{ display: "flex", gap: 24, marginTop: 36 }}>
            {[["Order", ShoppingCart], ["Approve", CheckSquare], ["Track", Truck]].map(([t, Ic]) => (
              <div key={t} style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <div style={{ width: 40, height: 40, borderRadius: T.radiusSm, background: isBlock ? "transparent" : T.surface2, border: `1px solid ${isBlock ? T.line : T.line2}`, display: "grid", placeItems: "center" }}>
                  <Ic size={18} color={T.accent} />
                </div>
                <span style={{ fontSize: 12, color: T.faint, fontFamily: isInstrument ? T.display : T.body, textTransform: isInstrument ? "uppercase" : "none", letterSpacing: isInstrument ? ".08em" : "0" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11.5, color: T.faint, position: "relative", zIndex: 2, fontFamily: isBlock ? T.mono : T.body, letterSpacing: isBlock ? ".06em" : "0" }}>
          {isBlock ? "FIELD OPERATIONS · GAUTENG · SHEET 1 OF 1" : "Field operations procurement · Gauteng"}
        </div>
      </div>

      {/* RIGHT — form */}
      <div style={{ display: "grid", placeItems: "center", padding: 40, position: "relative" }}>
        {/* theme switch in corner so it's visible before login */}
        <div style={{ position: "absolute", top: 22, right: 26, display: "flex", gap: 6 }}>
          {THEME_KEYS.map((k) => (
            <button key={k} onClick={() => setTheme(k)} title={THEMES[k].name}
              style={{ width: 22, height: 22, borderRadius: THEMES[k].radius ? 6 : 0, cursor: "pointer",
                background: THEMES[k].accent, border: themeKey === k ? `2px solid ${T.ink}` : `2px solid transparent`, outline: `1px solid ${T.line2}` }} />
          ))}
        </div>

        <div style={{ width: "100%", maxWidth: 372 }}>
          <div style={{ marginBottom: 26 }}>
            <h2 style={{ fontFamily: T.display, fontSize: isEditorial ? 30 : 25, margin: "0 0 7px", fontWeight: isEditorial ? 600 : 700, letterSpacing: isEditorial ? "-.01em" : "0" }}>
              {mode === "login" ? (isInstrument ? "SIGN IN" : "Sign in") : (isInstrument ? "CREATE ACCOUNT" : "Create your account")}
            </h2>
            <p style={{ color: T.ink2, fontSize: 13.5, margin: 0 }}>
              {mode === "login" ? "Welcome back. Enter your details to continue." : "Set up access to the procurement workspace."}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "register" && <label><FieldLabel T={T}>Full name</FieldLabel><Input T={T} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Stefan Kruger" /></label>}
            <label><FieldLabel T={T}>Email</FieldLabel><Input T={T} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" onKeyDown={(e) => e.key === "Enter" && submit()} /></label>
            <label><FieldLabel T={T}>Password</FieldLabel>
              <div style={{ position: "relative" }}>
                <Input T={T} value={password} onChange={(e) => setPassword(e.target.value)} type={showPw ? "text" : "password"} placeholder="••••••••" style={{ paddingRight: 40 }} onKeyDown={(e) => e.key === "Enter" && submit()} />
                <button onClick={() => setShowPw((s) => !s)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.faint, cursor: "pointer", padding: 4 }}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </label>
            {mode === "register" && <label><FieldLabel T={T}>Role</FieldLabel><Select T={T} value={role} onChange={(e) => setRole(e.target.value)}>{ROLES.filter((r) => r !== "Admin").map((r) => <option key={r}>{r}</option>)}</Select></label>}

            {err && <div style={{ background: T.bad + "1a", border: `1px solid ${T.bad}`, color: T.bad, borderRadius: T.radiusSm, padding: "9px 12px", fontSize: 13 }}>{err}</div>}
            <Btn T={T} kind="primary" onClick={submit} disabled={busy} style={{ marginTop: 4, padding: 12, fontSize: 14.5 }}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</Btn>
          </div>

          <div style={{ marginTop: 20, fontSize: 13, color: T.ink2, textAlign: "center" }}>
            {mode === "login" ? <>New here? <Lk T={T} onClick={() => { setMode("register"); setErr(""); }}>Create an account</Lk></>
              : <>Already have an account? <Lk T={T} onClick={() => { setMode("login"); setErr(""); }}>Sign in</Lk></>}
          </div>

          {mode === "login" && (
            <Panel T={T} stamp="DEMO" style={{ marginTop: 26, padding: 14 }}>
              <div style={{ fontSize: 11, color: T.faint, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8, fontFamily: T.body }}>Demo logins</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12, color: T.ink2, fontFamily: T.mono }}>
                <span>admin@demo.com / admin</span><span>gm@demo.com / gm</span>
                <span>requester@demo.com / req</span><span>finance@demo.com / fin</span>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
function Lk({ T, children, ...p }) { return <button {...p} style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontWeight: 600, fontSize: 13, padding: 0, fontFamily: T.body }}>{children}</button>; }

function Logo({ T, size = 38 }) {
  // distinct mark per theme
  if (T.sig === "editorial") {
    return <div style={{ width: size, height: size, borderRadius: "50%", background: T.accent, display: "grid", placeItems: "center", color: T.accentInk, fontFamily: T.display, fontWeight: 600, fontSize: size * 0.5 }}>P</div>;
  }
  if (T.sig === "instrument") {
    return <div style={{ width: size, height: size, borderRadius: T.radiusSm, background: T.accent, display: "grid", placeItems: "center", color: T.accentInk, fontFamily: T.display, fontWeight: 700, fontSize: size * 0.5, boxShadow: `0 0 18px ${T.accent}66` }}>P</div>;
  }
  return <div style={{ width: size, height: size, background: T.accent, display: "grid", placeItems: "center", color: T.accentInk, fontFamily: T.mono, fontWeight: 700, fontSize: size * 0.46, border: `1px solid ${T.ink}` }}>P</div>;
}

/* =========================================================================
   SHELL — sidebar, topbar, data layer
   ========================================================================= */
function Shell({ T, themeKey, setTheme, user, users, setUsers, onLogout, onUpdateUser, toast, showToast }) {
  const [view, setView] = useState("dashboard");
  const [catalog, setCatalog] = useState(SEED_CATALOG);
  const [orders, setOrders] = useState([]);
  const [backendUp, setBackendUp] = useState(null);
  const [navOpen, setNavOpen] = useState(true);

  const loadCatalog = useCallback(async () => {
    try { const d = await fetchJSON(EP.catalog); const c = { suppliers: d.suppliers || [], products: d.products || [] }; setCatalog(c); setBackendUp(true); store.set("cache_catalog", c); return c; }
    catch { setBackendUp(false); const cached = await store.get("cache_catalog", SEED_CATALOG); setCatalog(cached); return cached; }
  }, []);
  const loadOrders = useCallback(async () => {
    try { const d = await fetchJSON(EP.orders); const o = d.orders || []; setOrders(o); setBackendUp(true); store.set("cache_orders", o); return o; }
    catch { setBackendUp(false); const local = await store.get("local_orders", null); if (local) { setOrders(local); return local; } const cached = await store.get("cache_orders", []); setOrders(cached); return cached; }
  }, []);
  const refresh = useCallback(async () => { await Promise.all([loadCatalog(), loadOrders()]); }, [loadCatalog, loadOrders]);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { const t = setInterval(() => { if (backendUp) loadOrders(); }, 60000); return () => clearInterval(t); }, [backendUp, loadOrders]);

  const createOrder = useCallback(async (payload) => {
    try { const r = await fetchJSON(EP.intake, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); await loadOrders(); return { ok: true, reference: r.reference, mode: "live" }; }
    catch {
      const ref = "RFQ-" + (payload.supplierCode || "SUP") + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      const row = { recordId: "loc-" + Math.random().toString(36).slice(2, 9), reference: ref, status: "Quote Requested", supplier: payload.supplier, supplierEmail: payload.supplierEmail, requesterName: payload.requesterName, requesterEmail: payload.requesterEmail, jobNumber: payload.jobNumber || "", itemsSummary: payload.items.map((i) => i.qty + " x " + i.code + " - " + i.description).join("\n"), lineItems: payload.items, quotePdf: [], quotedTotal: null, poNumber: "", requestedAt: new Date().toISOString() };
      const next = [row, ...orders]; setOrders(next); await store.set("local_orders", next); return { ok: true, reference: ref, mode: "local" };
    }
  }, [orders, loadOrders]);

  const decide = useCallback(async (action, order, extra = {}) => {
    const body = { action, recordId: order.recordId, reference: order.reference, ...extra };
    try { const r = await fetchJSON(EP.decision, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); await loadOrders(); return { ok: true, ...r }; }
    catch {
      const next = orders.map((o) => {
        if (o.recordId !== order.recordId) return o;
        if (action === "submit") return { ...o, status: "Pending Approval", quotedTotal: extra.quotedTotal };
        if (action === "approve") { const maxPo = orders.reduce((m, x) => { const mm = String(x.poNumber || "").match(/PO-\d{4}-(\d+)/); return mm ? Math.max(m, +mm[1]) : m; }, 0); return { ...o, status: "Awaiting Delivery", poNumber: "PO-2026-" + String(maxPo + 1).padStart(4, "0"), decisionNote: extra.note || "" }; }
        if (action === "reject") return { ...o, status: "Rejected", decisionNote: extra.note || "" };
        if (action === "deliver") return { ...o, status: "Delivered" };
        return o;
      });
      setOrders(next); await store.set("local_orders", next); return { ok: true, mode: "local", poNumber: next.find((o) => o.recordId === order.recordId)?.poNumber };
    }
  }, [orders, loadOrders]);

  const NAV = useMemo(() => [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ROLES },
    { id: "order", label: "New Request", icon: ShoppingCart, roles: ["Admin", "Requester"] },
    { id: "quotes", label: "Quotes", icon: Inbox, roles: ["Admin", "Requester"] },
    { id: "approvals", label: "Approvals", icon: CheckSquare, roles: ["Admin", "GM", "Finance"] },
    { id: "orders", label: "Orders", icon: Package, roles: ROLES },
    { id: "suppliers", label: "Suppliers", icon: Building2, roles: ["Admin", "Requester", "GM", "Finance"] },
    { id: "users", label: "Team", icon: Users, roles: ["Admin"] },
    { id: "settings", label: "Settings", icon: SettingsIcon, roles: ROLES },
  ].filter((n) => n.roles.includes(user.role)), [user.role]);
  useEffect(() => { if (!NAV.some((n) => n.id === view)) setView("dashboard"); }, [NAV, view]);

  const ctx = { T, user, users, setUsers, catalog, orders, backendUp, refresh, createOrder, decide, showToast, onUpdateUser, themeKey, setTheme };
  const isBlock = T.sig === "titleblock";

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.ink, fontFamily: T.body, display: "flex",
      backgroundImage: isBlock ? T.grid : undefined, backgroundSize: isBlock ? T.gridSize : undefined }}>
      {/* Sidebar */}
      <aside style={{ width: navOpen ? 230 : 66, flex: "none", background: T.surface, borderRight: `1px solid ${T.line}`, display: "flex", flexDirection: "column", transition: "width .18s", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: navOpen ? "17px 18px" : "17px 0", display: "flex", alignItems: "center", justifyContent: navOpen ? "flex-start" : "center", gap: 11, borderBottom: `1px solid ${T.line}`, height: 60, boxSizing: "border-box" }}>
          <Logo T={T} size={32} />
          {navOpen && <div style={{ fontFamily: T.display, fontWeight: T.sig === "editorial" ? 600 : 700, fontSize: 16, letterSpacing: T.sig === "editorial" ? "-.01em" : ".01em" }}>Procure</div>}
        </div>
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
          {NAV.map((n) => {
            const active = view === n.id;
            const aBg = T.sig === "titleblock" ? T.accentSoft : T.sig === "instrument" ? T.accentSoft : T.accentSoft;
            return (
              <button key={n.id} onClick={() => setView(n.id)} title={n.label}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: navOpen ? "9px 12px" : "10px 0", justifyContent: navOpen ? "flex-start" : "center",
                  borderRadius: T.radiusSm, border: "none", borderLeft: active && isBlock ? `3px solid ${T.accent}` : "3px solid transparent", cursor: "pointer",
                  fontSize: 14, fontWeight: active ? 650 : 500, fontFamily: T.sig === "instrument" ? T.display : T.body,
                  letterSpacing: T.sig === "instrument" ? ".04em" : "0", textTransform: T.sig === "instrument" ? "uppercase" : "none",
                  background: active ? aBg : "transparent", color: active ? T.accent : T.ink2, textAlign: "left", width: "100%", transition: "background .12s" }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = T.surface2; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                <n.icon size={18} style={{ flex: "none" }} />{navOpen && <span>{n.label}</span>}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: 10, borderTop: `1px solid ${T.line}` }}>
          <button onClick={() => setNavOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: 12, padding: navOpen ? "9px 12px" : "10px 0", justifyContent: navOpen ? "flex-start" : "center", borderRadius: T.radiusSm, border: "none", cursor: "pointer", background: "transparent", color: T.faint, width: "100%", fontFamily: T.body, fontSize: 13 }}>
            <Menu size={17} style={{ flex: "none" }} />{navOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar T={T} user={user} view={view} NAV={NAV} backendUp={backendUp} onLogout={onLogout} refresh={refresh} orders={orders} themeKey={themeKey} setTheme={setTheme} />
        <main style={{ flex: 1, padding: "26px 30px", overflow: "auto" }}>
          {view === "dashboard" && <Dashboard ctx={ctx} setView={setView} />}
          {view === "order" && <OrderModule ctx={ctx} />}
          {view === "quotes" && <QuotesView ctx={ctx} />}
          {view === "approvals" && <Approvals ctx={ctx} />}
          {view === "orders" && <OrdersView ctx={ctx} />}
          {view === "suppliers" && <SuppliersView ctx={ctx} />}
          {view === "users" && <TeamView ctx={ctx} />}
          {view === "settings" && <SettingsView ctx={ctx} />}
        </main>
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", zIndex: 200, background: T.surface, border: `1px solid ${T.line2}`, borderLeft: `3px solid ${toast.kind === "err" ? T.bad : T.ok}`, borderRadius: T.radiusSm, padding: "12px 18px", fontSize: 13.5, boxShadow: T.shadow, maxWidth: 460, color: T.ink }}>{toast.msg}</div>
      )}
    </div>
  );
}

function Topbar({ T, user, view, NAV, backendUp, onLogout, refresh, orders, themeKey, setTheme }) {
  const [menu, setMenu] = useState(false);
  const title = NAV.find((n) => n.id === view)?.label || "Dashboard";
  const pending = orders.filter((o) => ["Quote Received", "Pending Approval"].includes(o.status)).length;
  const iconBtn = { background: T.surface2, border: `1px solid ${T.line2}`, color: T.ink2, borderRadius: T.radiusSm, width: 36, height: 36, display: "grid", placeItems: "center", cursor: "pointer" };
  return (
    <header style={{ height: 60, flex: "none", borderBottom: `1px solid ${T.line}`, background: T.surface, display: "flex", alignItems: "center", padding: "0 26px", gap: 14, position: "sticky", top: 0, zIndex: 30 }}>
      <h1 style={{ fontFamily: T.display, fontSize: T.sig === "editorial" ? 20 : 17, fontWeight: T.sig === "editorial" ? 600 : 700, margin: 0, letterSpacing: T.sig === "instrument" ? ".05em" : "0", textTransform: T.sig === "instrument" ? "uppercase" : "none" }}>{title}</h1>
      <div style={{ flex: 1 }} />
      <div title={backendUp === false ? "Working offline — changes saved locally" : "Connected to live backend"} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: backendUp === false ? T.warn : T.ok, background: T.surface2, border: `1px solid ${T.line2}`, padding: "6px 11px", borderRadius: 20, fontFamily: T.sig === "instrument" ? T.display : T.body, letterSpacing: T.sig === "instrument" ? ".06em" : "0", textTransform: T.sig === "instrument" ? "uppercase" : "none" }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: backendUp === false ? T.warn : T.ok, boxShadow: T.sig === "instrument" ? `0 0 6px ${backendUp === false ? T.warn : T.ok}` : "none" }} />{backendUp === false ? "Offline" : "Live"}
      </div>
      <button onClick={refresh} title="Refresh" style={iconBtn}><RefreshCw size={16} /></button>
      <button title="Notifications" style={{ ...iconBtn, position: "relative" }}><Bell size={16} />{pending > 0 && <span style={{ position: "absolute", top: 1, right: 1, background: T.accent, color: T.accentInk, fontSize: 9, fontWeight: 800, borderRadius: 8, padding: "1px 5px", fontFamily: T.mono }}>{pending}</span>}</button>
      <div style={{ position: "relative" }}>
        <button onClick={() => setMenu((m) => !m)} style={{ display: "flex", alignItems: "center", gap: 9, background: "transparent", border: "none", cursor: "pointer", color: T.ink, fontFamily: T.body }}>
          <Avatar T={T} name={user.name} size={32} />
          <div style={{ textAlign: "left", lineHeight: 1.2 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div><div style={{ fontSize: 11, color: T.faint }}>{user.role}</div></div>
          <ChevronDown size={15} color={T.faint} />
        </button>
        {menu && (
          <div style={{ position: "absolute", right: 0, top: 46, background: T.surface, border: `1px solid ${T.line2}`, borderRadius: T.radiusSm, minWidth: 190, padding: 6, boxShadow: T.shadow, zIndex: 40 }}>
            <div style={{ padding: "8px 12px", fontSize: 12, color: T.faint, borderBottom: `1px solid ${T.line}`, marginBottom: 4, fontFamily: T.mono }}>{user.email}</div>
            <div style={{ padding: "6px 12px", fontSize: 11, color: T.faint, textTransform: "uppercase", letterSpacing: ".06em" }}>Theme</div>
            {THEME_KEYS.map((k) => (
              <button key={k} onClick={() => setTheme(k)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 12px", background: themeKey === k ? T.surface2 : "transparent", border: "none", color: T.ink, cursor: "pointer", fontSize: 13, borderRadius: T.radiusSm, fontFamily: T.body, textAlign: "left" }}>
                <span style={{ width: 13, height: 13, borderRadius: THEMES[k].radius ? 4 : 0, background: THEMES[k].accent, outline: `1px solid ${T.line2}` }} />{THEMES[k].name}{themeKey === k && <Check size={13} style={{ marginLeft: "auto" }} />}
              </button>
            ))}
            <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", background: "transparent", border: "none", color: T.bad, cursor: "pointer", fontSize: 13.5, borderRadius: T.radiusSm, fontFamily: T.body, textAlign: "left", marginTop: 4, borderTop: `1px solid ${T.line}` }}><LogOut size={15} /> Sign out</button>
          </div>
        )}
      </div>
    </header>
  );
}
function Avatar({ T, name, size = 32 }) {
  const shape = T.sig === "editorial" ? "50%" : T.radiusSm;
  return <div style={{ width: size, height: size, borderRadius: shape, background: T.accent, color: T.accentInk, display: "grid", placeItems: "center", fontWeight: 700, fontSize: size * 0.4, fontFamily: T.sig === "instrument" ? T.display : T.body, flex: "none" }}>{initials(name)}</div>;
}

/* =========================================================================
   DASHBOARD
   ========================================================================= */
function Dashboard({ ctx, setView }) {
  const { T, orders, user, catalog } = ctx;
  const m = useMemo(() => {
    const by = (s) => orders.filter((o) => o.status === s).length;
    const spend = orders.filter((o) => ["Approved", "Awaiting Delivery", "Delivered"].includes(o.status)).reduce((s, o) => s + (Number(o.quotedTotal) || 0), 0);
    return { total: orders.length, q: by("Quote Requested"), qr: by("Quote Received"), pa: by("Pending Approval"), ad: by("Awaiting Delivery"), dl: by("Delivered"), spend };
  }, [orders]);
  const cards = [
    { label: "Total requests", value: m.total, icon: FileText, key: "info" },
    { label: "Awaiting quote", value: m.q, icon: Clock, key: "faint" },
    { label: "Quotes in", value: m.qr, icon: Inbox, key: "info" },
    { label: "Pending approval", value: m.pa, icon: CheckSquare, key: "warn" },
    { label: "Awaiting delivery", value: m.ad, icon: Truck, key: "cool" },
    { label: "Delivered", value: m.dl, icon: Check, key: "ok" },
  ];
  const recent = orders.slice(0, 6);
  return (
    <div style={{ maxWidth: 1180 }}>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontFamily: T.display, fontSize: T.sig === "editorial" ? 28 : 23, margin: "0 0 4px", fontWeight: T.sig === "editorial" ? 600 : 700, letterSpacing: T.sig === "editorial" ? "-.01em" : "0" }}>
          {T.sig === "instrument" ? `WELCOME BACK, ${user.name.split(" ")[0].toUpperCase()}` : `Welcome back, ${user.name.split(" ")[0]}.`}
        </h2>
        <p style={{ color: T.ink2, fontSize: 14, margin: 0 }}>Here's the state of procurement right now.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(168px, 1fr))", gap: 14, marginBottom: 16 }}>
        {cards.map((c, i) => (
          <Panel key={c.label} T={T} stamp={String(i + 1).padStart(2, "0")} style={{ padding: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: T.radiusSm, background: T[c.key] + "1f", display: "grid", placeItems: "center" }}><c.icon size={17} color={T[c.key]} /></div>
            <div style={{ fontFamily: T.mono, fontSize: 30, fontWeight: 700, marginTop: 12, color: T.ink }}>{c.value}</div>
            <div style={{ fontSize: 12.5, color: T.faint, marginTop: 2 }}>{c.label}</div>
          </Panel>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        <Panel T={T} stamp="LOG" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <SectionLabel T={T} n="01">Recent activity</SectionLabel>
            <Lk T={T} onClick={() => setView("orders")} style={{ marginTop: -10 }}>View all</Lk>
          </div>
          {recent.length === 0 ? <Empty T={T} text="No requests yet. Start one from New Request." /> : (
            <div>
              {recent.map((o) => (
                <div key={o.recordId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: `1px solid ${T.line2}` }}>
                  <span style={{ fontFamily: T.mono, fontSize: 12.5, color: T.accent, fontWeight: 600, minWidth: 132 }}>{o.reference}</span>
                  <span style={{ fontSize: 13, flex: 1 }}>{o.supplier}</span>
                  {o.quotedTotal != null && <span style={{ fontFamily: T.mono, fontSize: 12.5, color: T.ink2 }}>{money(o.quotedTotal)}</span>}
                  <StatusTag T={T} status={o.status} />
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel T={T} stamp="$$" style={{ padding: 20 }}>
          <SectionLabel T={T} n="02">Spend approved</SectionLabel>
          <div style={{ fontFamily: T.mono, fontSize: 28, fontWeight: 700, color: T.ok }}>{money(m.spend)}</div>
          <div style={{ fontSize: 12.5, color: T.faint, marginTop: 2 }}>across {m.ad + m.dl} orders</div>
          <div style={{ height: 1, background: T.line, margin: "18px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}><span style={{ color: T.faint }}>Suppliers</span><span style={{ fontWeight: 600, fontFamily: T.mono }}>{catalog.suppliers.length}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span style={{ color: T.faint }}>Products</span><span style={{ fontWeight: 600, fontFamily: T.mono }}>{catalog.products.length}</span></div>
        </Panel>
      </div>
    </div>
  );
}

/* =========================================================================
   ORDER MODULE
   ========================================================================= */
function OrderModule({ ctx }) {
  const { T, catalog, user, createOrder, showToast } = ctx;
  const [si, setSi] = useState(0); const [search, setSearch] = useState(""); const [cart, setCart] = useState({});
  const [reqName, setReqName] = useState(user.name); const [reqEmail, setReqEmail] = useState(user.email); const [jobNumber, setJobNumber] = useState(""); const [busy, setBusy] = useState(false);
  const supplier = catalog.suppliers[si] || null;
  const all = useMemo(() => supplier ? catalog.products.filter((p) => p.supplier === supplier.name) : [], [catalog, supplier]);
  const products = useMemo(() => { const q = search.toLowerCase().trim(); return q ? all.filter((p) => p.code.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) : all; }, [all, search]);
  const items = Object.values(cart); const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const add = (p) => setCart((c) => ({ ...c, [p.code]: { ...p, qty: (c[p.code]?.qty || 0) + 1 } }));
  const setQty = (code, q) => setCart((c) => { q = Math.max(0, q); if (!q) { const n = { ...c }; delete n[code]; return n; } return { ...c, [code]: { ...c[code], qty: q } }; });
  const submit = async () => {
    if (!supplier || !items.length || !reqName.trim() || !/.+@.+\..+/.test(reqEmail)) { showToast("Add items and your details first.", "err"); return; }
    setBusy(true);
    const r = await createOrder({ supplier: supplier.name, supplierCode: supplier.code, supplierEmail: supplier.email, requesterName: reqName.trim(), requesterEmail: reqEmail.trim(), jobNumber: jobNumber.trim(), items: items.map((i) => ({ code: i.code, description: i.description, qty: i.qty })) });
    setBusy(false);
    if (r.ok) { showToast(`Request ${r.reference} sent${r.mode === "local" ? " (saved offline)" : ""}.`); setCart({}); setJobNumber(""); } else showToast("Couldn't send the request.", "err");
  };
  const colHead = { fontFamily: T.sig === "instrument" ? T.display : T.body, fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", color: T.faint, fontWeight: 600 };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 18, maxWidth: 1180, alignItems: "start" }}>
      <div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ flex: "none", minWidth: 230 }}><FieldLabel T={T}>Supplier</FieldLabel><Select T={T} value={si} onChange={(e) => { setSi(+e.target.value); setCart({}); }} style={{ fontWeight: 600 }}>{catalog.suppliers.length === 0 && <option>No suppliers loaded</option>}{catalog.suppliers.map((s, i) => <option key={s.code + i} value={i}>{s.name} ({s.code})</option>)}</Select></div>
          <div style={{ flex: 1, minWidth: 220 }}><FieldLabel T={T}>Search parts</FieldLabel><div style={{ position: "relative" }}><Search size={16} color={T.faint} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} /><Input T={T} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Code or description…" style={{ paddingLeft: 36 }} /></div></div>
        </div>
        <Panel T={T} stamp="CAT" style={{ overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "150px 1fr 110px 84px", gap: 12, padding: "11px 16px", background: T.surface2, borderBottom: `1px solid ${T.line}`, ...colHead }}><span>Code</span><span>Description</span><span style={{ textAlign: "right" }}>Unit price</span><span /></div>
          <div style={{ maxHeight: "58vh", overflowY: "auto" }}>
            {!supplier ? <Empty T={T} text="No supplier selected." /> : all.length === 0 ? <Empty T={T} text={`No catalogue for ${supplier.name} yet.`} /> : products.length === 0 ? <Empty T={T} text="No parts match your search." /> :
              products.slice(0, 300).map((p) => { const inC = cart[p.code]; return (
                <div key={p.code} style={{ display: "grid", gridTemplateColumns: "150px 1fr 110px 84px", gap: 12, padding: "10px 16px", alignItems: "center", borderBottom: `1px solid ${T.line2}` }}>
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: T.accent, fontWeight: 600 }}>{p.code}</span>
                  <span style={{ fontSize: 13 }}>{p.description}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 12.5, textAlign: "right" }}>{money(p.price)}</span>
                  <button onClick={() => add(p)} style={{ justifySelf: "end", background: inC ? T.ok : T.surface2, color: inC ? (T.mode === "dark" ? "#06140d" : "#fff") : T.ink, border: `1px solid ${inC ? T.ok : T.line2}`, borderRadius: T.radiusSm, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.body, minWidth: 44 }}>{inC ? inC.qty : "Add"}</button>
                </div>); })}
          </div>
          {supplier && all.length > 0 && <div style={{ padding: "9px 16px", fontFamily: T.mono, fontSize: 11, color: T.faint, borderTop: `1px solid ${T.line}`, background: T.surface2 }}>{products.length} of {all.length} parts · {supplier.name}</div>}
        </Panel>
      </div>
      <Panel T={T} stamp="RFQ" style={{ position: "sticky", top: 86, display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 110px)" }}>
        <div style={{ padding: "15px 16px", borderBottom: `1px solid ${T.line}` }}><SectionLabel T={T}>Your request</SectionLabel><div style={{ fontFamily: T.mono, fontSize: 11, color: T.faint, marginTop: -8 }}>{supplier ? `RFQ-${supplier.code}-····` : "—"}</div></div>
        <div style={{ flex: 1, overflowY: "auto", minHeight: 60 }}>
          {items.length === 0 ? <Empty T={T} text="No parts added yet." /> : items.map((it) => (
            <div key={it.code} style={{ display: "flex", gap: 8, padding: "11px 16px", borderBottom: `1px solid ${T.line2}` }}>
              <div style={{ flex: 1 }}><div style={{ fontFamily: T.mono, fontSize: 12, color: T.accent, fontWeight: 600 }}>{it.code}</div><div style={{ fontSize: 11.5, color: T.faint, marginTop: 2 }}>{it.description}</div></div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", border: `1px solid ${T.line2}`, borderRadius: T.radiusSm, overflow: "hidden" }}>
                  <button onClick={() => setQty(it.code, it.qty - 1)} style={{ background: T.surface2, border: "none", color: T.ink, width: 24, height: 26, cursor: "pointer", display: "grid", placeItems: "center" }}><Minus size={12} /></button>
                  <span style={{ width: 30, textAlign: "center", fontFamily: T.mono, fontSize: 12 }}>{it.qty}</span>
                  <button onClick={() => setQty(it.code, it.qty + 1)} style={{ background: T.surface2, border: "none", color: T.ink, width: 24, height: 26, cursor: "pointer", display: "grid", placeItems: "center" }}><Plus size={12} /></button>
                </div>
                <span style={{ fontFamily: T.mono, fontSize: 12, color: T.ink2 }}>{money(it.price * it.qty)}</span>
              </div>
            </div>))}
        </div>
        <div style={{ padding: "13px 16px", borderTop: `1px solid ${T.line}`, background: T.surface2, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".05em", color: T.faint }}>Est. value</span>
          <span style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.accent }}>{money(total)}</span>
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, borderTop: `1px solid ${T.line}` }}>
          <div><FieldLabel T={T}>Job / reference number</FieldLabel><Input T={T} value={jobNumber} onChange={(e) => setJobNumber(e.target.value)} placeholder="e.g. JOB-2026-114 (optional)" /></div>
          <Input T={T} value={reqName} onChange={(e) => setReqName(e.target.value)} placeholder="Your name" />
          <Input T={T} value={reqEmail} onChange={(e) => setReqEmail(e.target.value)} placeholder="you@company.com" />
          <Btn T={T} kind="primary" onClick={submit} disabled={busy || !items.length} style={{ width: "100%", padding: 12 }}>{busy ? "Sending…" : "Send quote request"}</Btn>
          <p style={{ fontSize: 11, color: T.faint, margin: 0, lineHeight: 1.4 }}>The supplier is asked to reply with a PDF quote. Nothing is ordered until it's approved.</p>
        </div>
      </Panel>
    </div>
  );
}

/* =========================================================================
   APPROVALS
   ========================================================================= */
function Approvals({ ctx }) {
  const { T, orders, decide, showToast } = ctx;
  const [busy, setBusy] = useState({}); const [totals, setTotals] = useState({}); const [notes, setNotes] = useState({});
  const run = async (action, o, extra) => {
    setBusy((b) => ({ ...b, [o.recordId]: true }));
    const r = await decide(action, o, extra);
    setBusy((b) => ({ ...b, [o.recordId]: false }));
    if (r.ok) { const msg = action === "approve" && r.poNumber ? `Approved → ${r.poNumber}` : action === "submit" ? "Sent for approval" : action === "reject" ? "Rejected" : action === "deliver" ? "Marked delivered" : "Done"; showToast(msg + (r.mode === "local" ? " (offline)" : "")); } else showToast("Action failed.", "err");
  };
  const cols = [
    { key: "pending", title: "Pending approval", match: (o) => o.status === "Pending Approval", tk: "warn" },
    { key: "approved", title: "Awaiting delivery", match: (o) => o.status === "Awaiting Delivery", tk: "cool" },
    { key: "done", title: "Closed", match: (o) => ["Delivered", "Rejected"].includes(o.status), tk: "ok" },
  ];
  return (
    <div style={{ maxWidth: 1100 }}>
      <p style={{ color: T.ink2, fontSize: 14, margin: "0 0 18px" }}>Approve or reject submitted quotes, and track approved orders to delivery.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, alignItems: "start" }}>
        {cols.map((col, ci) => {
          const list = orders.filter(col.match);
          return (
            <div key={col.key}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ width: 9, height: 9, borderRadius: T.sig === "editorial" ? "50%" : 2, background: T[col.tk] }} />
                <h3 style={{ fontFamily: T.sig === "instrument" ? T.display : T.body, fontSize: 12, textTransform: "uppercase", letterSpacing: ".05em", margin: 0, fontWeight: 700, flex: 1, color: T.ink2 }}>{col.title}</h3>
                <span style={{ fontFamily: T.mono, fontSize: 12, color: T.faint, background: T.surface2, padding: "1px 8px", borderRadius: 10 }}>{list.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {list.length === 0 && <div style={{ padding: 20, textAlign: "center", color: T.faint, fontSize: 12, fontStyle: "italic", border: `1px dashed ${T.line}`, borderRadius: T.radiusSm }}>Nothing here</div>}
                {list.map((o) => (
                  <Panel key={o.recordId} T={T} style={{ padding: 13 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: T.mono, fontSize: 12.5, color: T.accent, fontWeight: 600 }}>{o.reference}</span>
                      {o.jobNumber ? <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ink2, background: T.surface2, border: `1px solid ${T.line2}`, borderRadius: T.radiusSm, padding: "1px 7px" }}>{o.jobNumber}</span> : null}
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 3 }}>{o.supplier}</div>
                    <div style={{ fontSize: 11.5, color: T.faint, marginTop: 4 }}>{o.requesterName} · {fmtDate(o.requestedAt)}</div>
                    {o.itemsSummary && <div style={{ fontFamily: T.mono, fontSize: 11, color: T.ink2, background: T.sunk, border: `1px solid ${T.line2}`, borderRadius: T.radiusSm, padding: "7px 9px", marginTop: 8, whiteSpace: "pre-wrap", maxHeight: 80, overflowY: "auto" }}>{o.itemsSummary}</div>}
                    {o.quotePdf?.length > 0 && <a href={o.quotePdf[0].url} target="_blank" rel="noopener" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: T.info, textDecoration: "none", marginTop: 8, border: `1px solid ${T.line2}`, borderRadius: T.radiusSm, padding: "4px 9px" }}><FileText size={12} /> {o.quotePdf[0].name} <ExternalLink size={11} /></a>}
                    {col.key === "pending" && (
                      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700 }}>{o.quotedTotal != null ? money(o.quotedTotal) : "—"} <span style={{ fontSize: 11, color: T.faint, fontWeight: 400 }}>quoted</span></div>
                        <Input T={T} value={notes[o.recordId] || ""} onChange={(e) => setNotes((n) => ({ ...n, [o.recordId]: e.target.value }))} placeholder="Note (optional)" style={{ fontSize: 12, padding: "7px 10px" }} />
                        <div style={{ display: "flex", gap: 8 }}>
                          <Btn T={T} kind="ok" disabled={busy[o.recordId]} onClick={() => run("approve", o, { note: notes[o.recordId] || "" })} style={{ flex: 1 }}>Approve</Btn>
                          <Btn T={T} kind="bad" disabled={busy[o.recordId]} onClick={() => { if (confirm("Reject " + o.reference + "?")) run("reject", o, { note: notes[o.recordId] || "" }); }} style={{ flex: 1 }}>Reject</Btn>
                        </div>
                      </div>)}
                    {col.key === "approved" && (
                      <div style={{ marginTop: 10 }}>
                        {o.poNumber && <div style={{ fontFamily: T.mono, fontSize: 12.5, color: T.ok, fontWeight: 600, marginBottom: 4 }}>{o.poNumber}</div>}
                        {o.quotedTotal != null && <div style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{money(o.quotedTotal)}</div>}
                        <Btn T={T} kind="ghost" disabled={busy[o.recordId]} onClick={() => run("deliver", o)} style={{ width: "100%" }}><Truck size={14} style={{ marginRight: 6, verticalAlign: "-2px" }} /> Mark delivered</Btn>
                      </div>)}
                    {col.key === "done" && (
                      <div style={{ marginTop: 8 }}><StatusTag T={T} status={o.status} />{o.poNumber && <span style={{ fontFamily: T.mono, fontSize: 12, color: T.faint, marginLeft: 8 }}>{o.poNumber}</span>}{o.decisionNote && <div style={{ fontSize: 11.5, color: T.faint, fontStyle: "italic", marginTop: 6 }}>“{o.decisionNote}”</div>}</div>)}
                  </Panel>
                ))}
              </div>
            </div>);
        })}
      </div>
    </div>
  );
}

/* =========================================================================
   QUOTES — requester's page: chase quotes, enter total, send for approval
   ========================================================================= */
function QuotesView({ ctx }) {
  const { T, orders, decide, showToast, user } = ctx;
  const [busy, setBusy] = useState({}); const [totals, setTotals] = useState({});
  // Requesters see their own orders; Admin sees all
  const mine = useMemo(() => {
    const open = orders.filter((o) => ["Quote Requested", "Quote Received"].includes(o.status));
    if (user.role === "Admin") return open;
    return open.filter((o) => (o.requesterEmail || "").toLowerCase() === user.email.toLowerCase() || (o.requesterName || "").toLowerCase() === user.name.toLowerCase());
  }, [orders, user]);
  const run = async (o) => {
    const t = parseFloat(String(totals[o.recordId]).replace(/[^0-9.]/g, ""));
    if (!t) { showToast("Enter the quoted total first.", "err"); return; }
    setBusy((b) => ({ ...b, [o.recordId]: true }));
    const r = await decide("submit", o, { quotedTotal: t });
    setBusy((b) => ({ ...b, [o.recordId]: false }));
    if (r.ok) showToast(`Sent ${o.reference} for approval${r.mode === "local" ? " (offline)" : ""}.`); else showToast("Couldn't send for approval.", "err");
  };
  const cols = [
    { key: "awaiting", title: "Awaiting supplier quote", match: (o) => o.status === "Quote Requested", tk: "faint" },
    { key: "received", title: "Quotes in — ready to submit", match: (o) => o.status === "Quote Received", tk: "info" },
  ];
  return (
    <div style={{ maxWidth: 980 }}>
      <p style={{ color: T.ink2, fontSize: 14, margin: "0 0 18px" }}>Track your RFQs. When a supplier's quote arrives, enter the total and send it up for approval.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, alignItems: "start" }}>
        {cols.map((col) => {
          const list = mine.filter(col.match);
          return (
            <div key={col.key}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ width: 9, height: 9, borderRadius: T.sig === "editorial" ? "50%" : 2, background: T[col.tk] }} />
                <h3 style={{ fontFamily: T.sig === "instrument" ? T.display : T.body, fontSize: 12, textTransform: "uppercase", letterSpacing: ".05em", margin: 0, fontWeight: 700, flex: 1, color: T.ink2 }}>{col.title}</h3>
                <span style={{ fontFamily: T.mono, fontSize: 12, color: T.faint, background: T.surface2, padding: "1px 8px", borderRadius: 10 }}>{list.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {list.length === 0 && <div style={{ padding: 20, textAlign: "center", color: T.faint, fontSize: 12, fontStyle: "italic", border: `1px dashed ${T.line}`, borderRadius: T.radiusSm }}>Nothing here</div>}
                {list.map((o) => (
                  <Panel key={o.recordId} T={T} style={{ padding: 13 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: T.mono, fontSize: 12.5, color: T.accent, fontWeight: 600 }}>{o.reference}</span>
                      {o.jobNumber ? <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ink2, background: T.surface2, border: `1px solid ${T.line2}`, borderRadius: T.radiusSm, padding: "1px 7px" }}>{o.jobNumber}</span> : null}
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 3 }}>{o.supplier}</div>
                    <div style={{ fontSize: 11.5, color: T.faint, marginTop: 4 }}>{o.requesterName} · {fmtDate(o.requestedAt)}</div>
                    {o.itemsSummary && <div style={{ fontFamily: T.mono, fontSize: 11, color: T.ink2, background: T.sunk, border: `1px solid ${T.line2}`, borderRadius: T.radiusSm, padding: "7px 9px", marginTop: 8, whiteSpace: "pre-wrap", maxHeight: 80, overflowY: "auto" }}>{o.itemsSummary}</div>}
                    {o.quotePdf?.length > 0 && <a href={o.quotePdf[0].url} target="_blank" rel="noopener" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: T.info, textDecoration: "none", marginTop: 8, border: `1px solid ${T.line2}`, borderRadius: T.radiusSm, padding: "4px 9px" }}><FileText size={12} /> {o.quotePdf[0].name || "Quote PDF"} <ExternalLink size={11} /></a>}
                    {col.key === "awaiting" && <div style={{ marginTop: 9, fontSize: 11, color: T.faint, fontStyle: "italic" }}>RFQ sent — waiting for the supplier to reply with a quote.</div>}
                    {col.key === "received" && (
                      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.sunk, border: `1px solid ${T.line2}`, borderRadius: T.radiusSm, padding: "6px 10px" }}><span style={{ fontFamily: T.mono, color: T.faint, fontSize: 13 }}>R</span><input value={totals[o.recordId] ?? (o.quotedTotal ?? "")} onChange={(e) => setTotals((t) => ({ ...t, [o.recordId]: e.target.value }))} placeholder="Quoted total from the PDF" style={{ flex: 1, background: "none", border: "none", color: T.ink, fontFamily: T.mono, fontSize: 13, outline: "none", width: "100%" }} /></div>
                        <Btn T={T} kind="primary" disabled={busy[o.recordId]} onClick={() => run(o)} style={{ width: "100%" }}>Send for approval</Btn>
                      </div>)}
                  </Panel>
                ))}
              </div>
            </div>);
        })}
      </div>
    </div>
  );
}

/* =========================================================================
   ORDERS
   ========================================================================= */
function OrdersView({ ctx }) {
  const { T, orders } = ctx;
  const [filter, setFilter] = useState("all"); const [q, setQ] = useState("");
  const filtered = useMemo(() => { let l = orders; if (filter !== "all") l = l.filter((o) => o.status === filter); const s = q.toLowerCase().trim(); if (s) l = l.filter((o) => o.reference.toLowerCase().includes(s) || (o.supplier || "").toLowerCase().includes(s) || (o.poNumber || "").toLowerCase().includes(s)); return l; }, [orders, filter, q]);
  const colHead = { fontFamily: T.sig === "instrument" ? T.display : T.body, fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", color: T.faint, fontWeight: 600 };
  return (
    <div style={{ maxWidth: 1180 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}><Search size={16} color={T.faint} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} /><Input T={T} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reference, supplier, PO…" style={{ paddingLeft: 36 }} /></div>
        <Select T={T} value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: "auto" }}><option value="all">All statuses</option>{Object.keys(STATUS).map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}</Select>
      </div>
      <Panel T={T} stamp="ORD" style={{ overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "150px 1fr 130px 120px 150px", gap: 12, padding: "11px 18px", background: T.surface2, borderBottom: `1px solid ${T.line}`, ...colHead }}><span>Reference</span><span>Supplier</span><span style={{ textAlign: "right" }}>Total</span><span>PO</span><span>Status</span></div>
        {filtered.length === 0 ? <Empty T={T} text="No orders match." /> : filtered.map((o) => (
          <div key={o.recordId} style={{ display: "grid", gridTemplateColumns: "150px 1fr 130px 120px 150px", gap: 12, padding: "12px 18px", alignItems: "center", borderBottom: `1px solid ${T.line2}`, fontSize: 13 }}>
            <div><span style={{ fontFamily: T.mono, fontSize: 12, color: T.accent, fontWeight: 600 }}>{o.reference}</span>{o.jobNumber ? <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.faint, marginTop: 2 }}>{o.jobNumber}</div> : null}</div>
            <div><div>{o.supplier}</div><div style={{ fontSize: 11, color: T.faint, marginTop: 2 }}>{o.requesterName} · {fmtDate(o.requestedAt)}</div></div>
            <span style={{ fontFamily: T.mono, fontSize: 12.5, textAlign: "right", color: o.quotedTotal != null ? T.ink : T.faint }}>{o.quotedTotal != null ? money(o.quotedTotal) : "—"}</span>
            <span style={{ fontFamily: T.mono, fontSize: 12, color: o.poNumber ? T.ok : T.faint }}>{o.poNumber || "—"}</span>
            <StatusTag T={T} status={o.status} />
          </div>))}
      </Panel>
    </div>
  );
}

/* =========================================================================
   SUPPLIERS
   ========================================================================= */
function SuppliersView({ ctx }) {
  const { T, catalog } = ctx;
  const [q, setQ] = useState("");
  const rows = useMemo(() => catalog.suppliers.map((s) => ({ ...s, count: catalog.products.filter((p) => p.supplier === s.name).length })).filter((s) => !q || s.name.toLowerCase().includes(q.toLowerCase()) || (s.code || "").toLowerCase().includes(q.toLowerCase())), [catalog, q]);
  return (
    <div style={{ maxWidth: 1180 }}>
      <div style={{ position: "relative", marginBottom: 16 }}><Search size={16} color={T.faint} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} /><Input T={T} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search suppliers…" style={{ paddingLeft: 36 }} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {rows.length === 0 ? <Empty T={T} text="No suppliers loaded." /> : rows.map((s) => (
          <Panel key={(s.code || "") + s.name} T={T} stamp={s.code} style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: T.sig === "editorial" ? "50%" : T.radiusSm, background: T.accentSoft, display: "grid", placeItems: "center", color: T.accent, fontWeight: 700, fontFamily: T.mono, fontSize: 13 }}>{s.code}</div>
              <span style={{ fontFamily: T.mono, fontSize: 11.5, color: T.faint, background: T.surface2, padding: "3px 9px", borderRadius: 10 }}>{s.count} parts</span>
            </div>
            <div style={{ fontWeight: 650, fontSize: 14.5, fontFamily: T.sig === "editorial" ? T.display : T.body }}>{s.name}</div>
            {s.contact && <div style={{ fontSize: 12.5, color: T.faint, marginTop: 4 }}>{s.contact}</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: T.ink2, marginTop: 8 }}><Mail size={13} /> {s.email}</div>
          </Panel>))}
      </div>
    </div>
  );
}

/* =========================================================================
   TEAM
   ========================================================================= */
function TeamView({ ctx }) {
  const { T, users, setUsers, showToast, user } = ctx;
  const [adding, setAdding] = useState(false); const [f, setF] = useState({ name: "", email: "", password: "", role: "Requester" });
  const addUser = async () => {
    if (!f.name.trim() || !f.email.trim() || !f.password) { showToast("Fill in every field.", "err"); return; }
    if (users.some((u) => u.email.toLowerCase() === f.email.toLowerCase())) { showToast("Email already exists.", "err"); return; }
    const nu = { id: "u-" + Math.random().toString(36).slice(2, 9), ...f, email: f.email.trim().toLowerCase() };
    const next = [...users, nu]; setUsers(next); await store.set("users", next);
    try { await fetchJSON(EP.auth, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "register", ...nu }) }); } catch {}
    setF({ name: "", email: "", password: "", role: "Requester" }); setAdding(false); showToast("Team member added.");
  };
  const changeRole = async (id, role) => { const next = users.map((u) => u.id === id ? { ...u, role } : u); setUsers(next); await store.set("users", next); showToast("Role updated."); };
  const remove = async (id) => { if (id === user.id) { showToast("You can't remove yourself.", "err"); return; } if (!confirm("Remove this team member?")) return; const next = users.filter((u) => u.id !== id); setUsers(next); await store.set("users", next); showToast("Team member removed."); };
  const colHead = { fontFamily: T.sig === "instrument" ? T.display : T.body, fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", color: T.faint, fontWeight: 600 };
  return (
    <div style={{ maxWidth: 920 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ color: T.ink2, fontSize: 14, margin: 0 }}>Manage who can access the workspace and what they can do.</p>
        <Btn T={T} kind="primary" onClick={() => setAdding((a) => !a)}><Plus size={15} style={{ marginRight: 6, verticalAlign: "-2px" }} /> Add member</Btn>
      </div>
      {adding && (
        <Panel T={T} style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input T={T} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Full name" />
            <Input T={T} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Email" />
            <Input T={T} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="Temp password" />
            <Select T={T} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>{ROLES.map((r) => <option key={r}>{r}</option>)}</Select>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}><Btn T={T} onClick={() => setAdding(false)}>Cancel</Btn><Btn T={T} kind="primary" onClick={addUser}>Add member</Btn></div>
        </Panel>)}
      <Panel T={T} stamp="TEAM" style={{ overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 150px 60px", gap: 12, padding: "11px 18px", background: T.surface2, borderBottom: `1px solid ${T.line}`, ...colHead }}><span>Name</span><span>Email</span><span>Role</span><span /></div>
        {users.map((u) => (
          <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 150px 60px", gap: 12, padding: "12px 18px", alignItems: "center", borderBottom: `1px solid ${T.line2}`, fontSize: 13 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar T={T} name={u.name} size={30} />{u.name}{u.id === user.id && <span style={{ fontSize: 11, color: T.faint }}>(you)</span>}</div>
            <span style={{ color: T.ink2, fontFamily: T.mono, fontSize: 12 }}>{u.email}</span>
            <Select T={T} value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} style={{ padding: "6px 10px", fontSize: 12.5 }}>{ROLES.map((r) => <option key={r}>{r}</option>)}</Select>
            <button onClick={() => remove(u.id)} style={{ background: "none", border: "none", color: T.faint, cursor: "pointer", justifySelf: "end" }}><Trash2 size={15} /></button>
          </div>))}
      </Panel>
    </div>
  );
}

/* =========================================================================
   SETTINGS — incl. theme gallery
   ========================================================================= */
function SettingsView({ ctx }) {
  const { T, user, onUpdateUser, showToast, backendUp, themeKey, setTheme } = ctx;
  const [name, setName] = useState(user.name);
  const save = async () => { await onUpdateUser({ name }); showToast("Settings saved."); };
  return (
    <div style={{ maxWidth: 760 }}>
      <Panel T={T} stamp="UI" style={{ padding: 22, marginBottom: 16 }}>
        <SectionLabel T={T} n="01">Theme</SectionLabel>
        <p style={{ color: T.ink2, fontSize: 13.5, margin: "0 0 16px" }}>Three complete looks. Pick the one that fits how your team works — it applies everywhere, instantly.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {THEME_KEYS.map((k) => { const TT = THEMES[k]; const active = themeKey === k; return (
            <button key={k} onClick={() => setTheme(k)} style={{ textAlign: "left", cursor: "pointer", padding: 0, border: active ? `2px solid ${T.accent}` : `1px solid ${T.line2}`, borderRadius: T.radiusSm, overflow: "hidden", background: TT.bg }}>
              <div style={{ height: 70, background: TT.surface, borderBottom: `1px solid ${TT.line}`, padding: 12, position: "relative", backgroundImage: TT.sig === "titleblock" ? TT.grid : undefined, backgroundSize: TT.sig === "titleblock" ? TT.gridSize : undefined }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ width: 18, height: 18, borderRadius: TT.sig === "editorial" ? "50%" : TT.radiusSm, background: TT.accent }} />
                  <span style={{ fontFamily: TT.display, fontWeight: 700, fontSize: 13, color: TT.ink }}>Aa</span>
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 10 }}>{[TT.ok, TT.warn, TT.info, TT.cool].map((c, i) => <span key={i} style={{ width: 14, height: 5, background: c, borderRadius: 2 }} />)}</div>
              </div>
              <div style={{ padding: "10px 12px" }}>
                <div style={{ fontFamily: TT.display, fontWeight: TT.sig === "editorial" ? 600 : 700, fontSize: 13.5, color: TT.ink }}>{TT.name}</div>
                <div style={{ fontSize: 11, color: TT.faint, marginTop: 2 }}>{TT.blurb}</div>
                {active && <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 11, color: T.accent, fontWeight: 600 }}><Check size={12} /> Active</div>}
              </div>
            </button>); })}
        </div>
      </Panel>
      <Panel T={T} stamp="ME" style={{ padding: 22, marginBottom: 16 }}>
        <SectionLabel T={T} n="02">Profile</SectionLabel>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
          <Avatar T={T} name={name} size={54} />
          <div><div style={{ fontSize: 12, color: T.faint }}>Signed in as <b style={{ color: T.ink }}>{user.role}</b></div><div style={{ fontSize: 13, color: T.ink2, marginTop: 2, fontFamily: T.mono }}>{user.email}</div></div>
        </div>
        <FieldLabel T={T}>Display name</FieldLabel><Input T={T} value={name} onChange={(e) => setName(e.target.value)} />
      </Panel>
      <Panel T={T} stamp="SYS" style={{ padding: 22, marginBottom: 16 }}>
        <SectionLabel T={T} n="03">System</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div><div style={{ fontSize: 13.5, fontWeight: 600 }}>Backend connection</div><div style={{ fontSize: 12, color: T.faint, marginTop: 2 }}>Live = shared data via your n8n + Airtable.</div></div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: backendUp === false ? T.warn : T.ok }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: backendUp === false ? T.warn : T.ok }} />{backendUp === false ? "Offline — saving locally" : "Connected"}</span>
        </div>
      </Panel>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><Btn T={T} kind="primary" onClick={save}>Save changes</Btn></div>
    </div>
  );
}
