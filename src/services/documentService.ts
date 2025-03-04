import {
    Document,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    BorderStyle,
    TextRun,
    AlignmentType,
    WidthType,
    HeightRule,
    convertInchesToTwip,
    ISectionOptions
} from 'docx';
import { saveAs } from 'file-saver';
import type { Invoice, Receipt } from '../types/invoice';
import { formatDate } from '../utils/dateUtils';
import { formatCurrency } from '../utils/numberUtils';
import { Packer } from 'docx';

export class DocumentService {
    private lastInvoiceNumber: { [key: string]: number } = {
        '二聯式': 0,
        '三聯式': 0
    };

    private async generateInvoiceNumber(type: '二聯式' | '三聯式'): Promise<string> {
        // 從 localStorage 讀取最後使用的編號
        const storedNumber = localStorage.getItem(`lastInvoiceNumber_${type}`);
        let currentNumber = storedNumber ? parseInt(storedNumber) : 0;

        // 增加編號
        currentNumber += 1;

        // 儲存新編號
        localStorage.setItem(`lastInvoiceNumber_${type}`, currentNumber.toString());

        // 格式化編號為 8 位數，前面補 0
        return `AB-${currentNumber.toString().padStart(8, '0')}`;
    }

    private createInvoicePage(doc: Invoice, pageType: '存根聯' | '收執聯' | '報帳聯' | '扣抵聯'): Document {
        const document = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `${doc.type}發票 - ${pageType}`,
                                bold: true,
                                size: 24
                            })
                        ],
                        alignment: 'center'
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `發票號碼：${doc.invoiceNumber}`,
                                size: 20
                            })
                        ]
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `開立日期：${doc.date}`,
                                size: 20
                            })
                        ]
                    }),
                    new Table({
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ text: '品名' })],
                                        width: { size: 40, type: 'pct' }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ text: '數量' })],
                                        width: { size: 20, type: 'pct' }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ text: '單價' })],
                                        width: { size: 20, type: 'pct' }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ text: '金額' })],
                                        width: { size: 20, type: 'pct' }
                                    })
                                ]
                            }),
                            ...doc.items.map(item =>
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            children: [new Paragraph({ text: item.description })]
                                        }),
                                        new TableCell({
                                            children: [new Paragraph({ text: item.quantity.toString() })]
                                        }),
                                        new TableCell({
                                            children: [new Paragraph({ text: item.unitPrice.toLocaleString() })]
                                        }),
                                        new TableCell({
                                            children: [new Paragraph({ text: item.amount.toLocaleString() })]
                                        })
                                    ]
                                })
                            )
                        ]
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `總計：${doc.amount.toLocaleString()}`,
                                bold: true,
                                size: 20
                            })
                        ],
                        alignment: 'right'
                    })
                ]
            }]
        });

        return document;
    }

    private async generateInvoiceDoc(invoice: Invoice): Promise<Document> {
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: `${invoice.type}發票`,
                                size: 32,
                                bold: true
                            })
                        ]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                            new TextRun({
                                text: `開立日期：${formatDate(invoice.date)}`,
                                size: 24
                            })
                        ]
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `發票號碼：${invoice.invoiceNumber}`,
                                size: 24
                            })
                        ]
                    }),
                    new Table({
                        width: {
                            size: 100,
                            type: WidthType.PERCENTAGE
                        },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1 },
                            bottom: { style: BorderStyle.SINGLE, size: 1 },
                            left: { style: BorderStyle.SINGLE, size: 1 },
                            right: { style: BorderStyle.SINGLE, size: 1 },
                            insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                            insideVertical: { style: BorderStyle.SINGLE, size: 1 }
                        },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: {
                                            size: 20,
                                            type: WidthType.PERCENTAGE
                                        },
                                        children: [new Paragraph('賣方資訊')]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 80,
                                            type: WidthType.PERCENTAGE
                                        },
                                        children: [
                                            new Paragraph(`名稱：${invoice.sellerName}`),
                                            new Paragraph(`統一編號：${invoice.sellerTaxId}`)
                                        ]
                                    })
                                ]
                            }),
                            ...(invoice.type === '三聯式' ? [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            width: {
                                                size: 20,
                                                type: WidthType.PERCENTAGE
                                            },
                                            children: [new Paragraph('買方資訊')]
                                        }),
                                        new TableCell({
                                            width: {
                                                size: 80,
                                                type: WidthType.PERCENTAGE
                                            },
                                            children: [
                                                new Paragraph(`名稱：${invoice.buyerName}`),
                                                new Paragraph(`統一編號：${invoice.buyerTaxId}`)
                                            ]
                                        })
                                    ]
                                })
                            ] : [])
                        ]
                    }),
                    new Paragraph({ spacing: { before: convertInchesToTwip(0.5) } }),
                    new Table({
                        width: {
                            size: 100,
                            type: WidthType.PERCENTAGE
                        },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1 },
                            bottom: { style: BorderStyle.SINGLE, size: 1 },
                            left: { style: BorderStyle.SINGLE, size: 1 },
                            right: { style: BorderStyle.SINGLE, size: 1 },
                            insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                            insideVertical: { style: BorderStyle.SINGLE, size: 1 }
                        },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: {
                                            size: 40,
                                            type: WidthType.PERCENTAGE
                                        },
                                        children: [new Paragraph({ text: '品名', alignment: AlignmentType.CENTER })]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 15,
                                            type: WidthType.PERCENTAGE
                                        },
                                        children: [new Paragraph({ text: '數量', alignment: AlignmentType.CENTER })]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 20,
                                            type: WidthType.PERCENTAGE
                                        },
                                        children: [new Paragraph({ text: '單價', alignment: AlignmentType.CENTER })]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 25,
                                            type: WidthType.PERCENTAGE
                                        },
                                        children: [new Paragraph({ text: '金額', alignment: AlignmentType.CENTER })]
                                    })
                                ]
                            }),
                            ...invoice.items.map(item => new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph(item.description)]
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            text: item.quantity.toString(),
                                            alignment: AlignmentType.RIGHT
                                        })]
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            text: formatCurrency(item.unitPrice),
                                            alignment: AlignmentType.RIGHT
                                        })]
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            text: formatCurrency(item.amount),
                                            alignment: AlignmentType.RIGHT
                                        })]
                                    })
                                ]
                            }))
                        ]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: convertInchesToTwip(0.5) },
                        children: [
                            new TextRun({
                                text: `小計：${formatCurrency(invoice.amount)}`,
                                size: 24
                            })
                        ]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                            new TextRun({
                                text: `營業稅：${formatCurrency(invoice.taxAmount)}`,
                                size: 24
                            })
                        ]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                            new TextRun({
                                text: `總計：${formatCurrency(invoice.amount + invoice.taxAmount)}`,
                                size: 24,
                                bold: true
                            })
                        ]
                    })
                ]
            }]
        });

        return doc;
    }

    private async generateReceiptDoc(receipt: Receipt): Promise<Document> {
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: '收據',
                                size: 32,
                                bold: true
                            })
                        ]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                            new TextRun({
                                text: `開立日期：${formatDate(receipt.date)}`,
                                size: 24
                            })
                        ]
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `收據號碼：${receipt.receiptNumber}`,
                                size: 24
                            })
                        ]
                    }),
                    new Paragraph({
                        spacing: { before: convertInchesToTwip(0.5) },
                        children: [
                            new TextRun({
                                text: `茲收到 ${receipt.payerName} 繳納`,
                                size: 24
                            })
                        ]
                    }),
                    new Paragraph({
                        spacing: { before: convertInchesToTwip(0.5) },
                        children: [
                            new TextRun({
                                text: `${receipt.description}`,
                                size: 24,
                                bold: true
                            })
                        ]
                    }),
                    new Paragraph({
                        spacing: { before: convertInchesToTwip(0.5) },
                        children: [
                            new TextRun({
                                text: `新台幣 ${formatCurrency(receipt.amount)} 元整`,
                                size: 24,
                                bold: true
                            })
                        ]
                    }),
                    new Paragraph({
                        spacing: { before: convertInchesToTwip(2) },
                        alignment: AlignmentType.RIGHT,
                        children: [
                            new TextRun({
                                text: '收款人：',
                                size: 24
                            })
                        ]
                    })
                ]
            }]
        });

        return doc;
    }

    async generateDocument(document: Invoice | Receipt): Promise<Blob> {
        let doc: Document;

        if ('invoiceNumber' in document) {
            doc = await this.generateInvoiceDoc(document as Invoice);
        } else {
            doc = await this.generateReceiptDoc(document as Receipt);
        }

        return await Packer.toBlob(doc);
    }

    async printDocument(doc: Invoice | Receipt): Promise<void> {
        try {
            if (doc.type === '收據') {
                // 處理收據列印
                const document = new Document({
                    sections: [{
                        properties: {},
                        children: [
                            // ... 收據內容 ...
                        ]
                    }]
                });
                const blob = await Packer.toBlob(document);
                saveAs(blob, `收據_${doc.receiptNumber}.docx`);
            } else {
                // 處理發票列印
                const invoice = doc as Invoice;
                const pages = doc.type === '二聯式'
                    ? ['存根聯', '收執聯']
                    : ['存根聯', '報帳聯', '扣抵聯'];

                // 為每一聯產生獨立的文件
                const documents = pages.map(pageType =>
                    this.createInvoicePage(invoice, pageType as any)
                );

                // 合併所有文件的 sections
                const allSections: ISectionOptions[] = [];
                for (const doc of documents) {
                    const docWithSections = doc as unknown as { sections: ISectionOptions[] };
                    allSections.push(...docWithSections.sections);
                }

                // 建立合併後的文件
                const mergedDoc = new Document({
                    sections: allSections
                });

                const blob = await Packer.toBlob(mergedDoc);
                saveAs(blob, `發票_${invoice.invoiceNumber}.docx`);
            }
        } catch (error) {
            console.error('列印文件失敗:', error);
            throw error;
        }
    }
}

export const documentService = new DocumentService(); 