import { Request, Response } from 'express';
import { Company } from '../models';
import { v4 as uuidv4 } from 'uuid';

// 生成公司編號
const generateCompanyNo = async (): Promise<string> => {
    // 查找所有公司數量
    const companies = await Company.findAll();
    const count = companies.length;

    // 生成新的公司編號 A001, A002, ...
    const paddedCount = String(count + 1).padStart(3, '0');
    return `A${paddedCount}`;
};

// 獲取所有公司
export const getAllCompanies = async (req: Request, res: Response) => {
    try {
        const companies = await Company.findAll();
        res.status(200).json(companies);
    } catch (error) {
        console.error('獲取公司列表錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
};

// 獲取單個公司
export const getCompanyById = async (req: Request, res: Response) => {
    try {
        const company = await Company.findByPk(req.params.id);

        if (!company) {
            return res.status(404).json({ message: '公司不存在' });
        }

        res.status(200).json(company);
    } catch (error) {
        console.error('獲取公司詳情錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
};

// 創建公司
export const createCompany = async (req: Request, res: Response) => {
    try {
        const { taxId, name, nameEn, industry, address, contact, fax, note } = req.body;

        // 基本驗證
        if (!taxId || !name || !address) {
            return res.status(400).json({ message: '統一編號、公司名稱和地址為必填項' });
        }

        // 檢查統一編號是否已存在
        const existingCompany = await Company.findOne({ where: { taxId } });
        if (existingCompany) {
            return res.status(400).json({ message: '此統一編號已存在' });
        }

        // 生成公司編號
        const companyNo = await generateCompanyNo();

        // 將聯絡人資訊轉為 JSON 字符串
        const contactString = typeof contact === 'string' ? contact : JSON.stringify(contact);

        // 創建公司
        const newCompany = await Company.create({
            id: uuidv4(),
            companyNo,
            taxId,
            name,
            nameEn,
            industry,
            address,
            contact: contactString,
            fax,
            note
        });

        res.status(201).json({
            message: '公司創建成功',
            company: newCompany
        });
    } catch (error) {
        console.error('創建公司錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
};

// 更新公司
export const updateCompany = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { taxId, name, nameEn, industry, address, contact, fax, note } = req.body;

        // 查找公司
        const company = await Company.findByPk(id);

        if (!company) {
            return res.status(404).json({ message: '公司不存在' });
        }

        // 檢查統一編號是否已被其他公司使用
        if (taxId && taxId !== company.taxId) {
            const existingCompany = await Company.findOne({ where: { taxId } });
            if (existingCompany && existingCompany.id !== id) {
                return res.status(400).json({ message: '此統一編號已被其他公司使用' });
            }
        }

        // 將聯絡人資訊轉為 JSON 字符串
        const contactString = contact ? (typeof contact === 'string' ? contact : JSON.stringify(contact)) : company.contact;

        // 更新公司
        await company.update({
            taxId: taxId || company.taxId,
            name: name || company.name,
            nameEn: nameEn || company.nameEn,
            industry: industry || company.industry,
            address: address || company.address,
            contact: contactString,
            fax: fax !== undefined ? fax : company.fax,
            note: note !== undefined ? note : company.note
        });

        res.status(200).json({
            message: '公司更新成功',
            company: await Company.findByPk(id)
        });
    } catch (error) {
        console.error('更新公司錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
};

// 刪除公司
export const deleteCompany = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // 查找公司
        const company = await Company.findByPk(id);

        if (!company) {
            return res.status(404).json({ message: '公司不存在' });
        }

        // 刪除公司
        await company.destroy();

        res.status(200).json({ message: '公司已刪除' });
    } catch (error) {
        console.error('刪除公司錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
}; 