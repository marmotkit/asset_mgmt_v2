"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyService = void 0;
const api_service_1 = require("./api.service");
class CompanyService {
    async getCompanies() {
        return api_service_1.ApiService.getCompanies();
    }
    async getCompanyById(companyId) {
        const companies = await this.getCompanies();
        return companies.find(company => company.id === companyId);
    }
}
exports.companyService = new CompanyService();
