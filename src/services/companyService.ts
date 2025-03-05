import { Company } from '../types/company';
import { ApiService } from './api.service';

class CompanyService {
    async getCompanies(): Promise<Company[]> {
        return ApiService.getCompanies();
    }

    async getCompanyById(companyId: string): Promise<Company | undefined> {
        const companies = await this.getCompanies();
        return companies.find(company => company.id === companyId);
    }
}

export const companyService = new CompanyService(); 