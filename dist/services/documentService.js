"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentService = exports.DocumentService = void 0;
const docx_1 = require("docx");
const file_saver_1 = require("file-saver");
const dateUtils_1 = require("../utils/dateUtils");
const numberUtils_1 = require("../utils/numberUtils");
const docx_2 = require("docx");
class DocumentService {
    constructor() {
        this.lastInvoiceNumber = {
            '二聯式': 0,
            '三聯式': 0
        };
    }
    async generateInvoiceNumber(type) {
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
    createInvoicePage(doc, pageType) {
        const document = new docx_1.Document({
            sections: [{
                    properties: {},
                    children: [
                        new docx_1.Paragraph({
                            children: [
                                new docx_1.TextRun({
                                    text: `${doc.type}發票 - ${pageType}`,
                                    bold: true,
                                    size: 24
                                })
                            ],
                            alignment: 'center'
                        }),
                        new docx_1.Paragraph({
                            children: [
                                new docx_1.TextRun({
                                    text: `發票號碼：${doc.invoiceNumber}`,
                                    size: 20
                                })
                            ]
                        }),
                        new docx_1.Paragraph({
                            children: [
                                new docx_1.TextRun({
                                    text: `開立日期：${doc.date}`,
                                    size: 20
                                })
                            ]
                        }),
                        new docx_1.Table({
                            rows: [
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            children: [new docx_1.Paragraph({ text: '品名' })],
                                            width: { size: 40, type: 'pct' }
                                        }),
                                        new docx_1.TableCell({
                                            children: [new docx_1.Paragraph({ text: '數量' })],
                                            width: { size: 20, type: 'pct' }
                                        }),
                                        new docx_1.TableCell({
                                            children: [new docx_1.Paragraph({ text: '單價' })],
                                            width: { size: 20, type: 'pct' }
                                        }),
                                        new docx_1.TableCell({
                                            children: [new docx_1.Paragraph({ text: '金額' })],
                                            width: { size: 20, type: 'pct' }
                                        })
                                    ]
                                }),
                                ...doc.items.map(item => new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            children: [new docx_1.Paragraph({ text: item.description })]
                                        }),
                                        new docx_1.TableCell({
                                            children: [new docx_1.Paragraph({ text: item.quantity.toString() })]
                                        }),
                                        new docx_1.TableCell({
                                            children: [new docx_1.Paragraph({ text: item.unitPrice.toLocaleString() })]
                                        }),
                                        new docx_1.TableCell({
                                            children: [new docx_1.Paragraph({ text: item.amount.toLocaleString() })]
                                        })
                                    ]
                                }))
                            ]
                        }),
                        new docx_1.Paragraph({
                            children: [
                                new docx_1.TextRun({
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
    async generateInvoiceDoc(invoice) {
        const doc = new docx_1.Document({
            sections: [{
                    properties: {},
                    children: [
                        new docx_1.Paragraph({
                            alignment: docx_1.AlignmentType.CENTER,
                            children: [
                                new docx_1.TextRun({
                                    text: `${invoice.type}發票`,
                                    size: 32,
                                    bold: true
                                })
                            ]
                        }),
                        new docx_1.Paragraph({
                            alignment: docx_1.AlignmentType.RIGHT,
                            children: [
                                new docx_1.TextRun({
                                    text: `開立日期：${(0, dateUtils_1.formatDate)(invoice.date)}`,
                                    size: 24
                                })
                            ]
                        }),
                        new docx_1.Paragraph({
                            children: [
                                new docx_1.TextRun({
                                    text: `發票號碼：${invoice.invoiceNumber}`,
                                    size: 24
                                })
                            ]
                        }),
                        new docx_1.Table({
                            width: {
                                size: 100,
                                type: docx_1.WidthType.PERCENTAGE
                            },
                            borders: {
                                top: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                                bottom: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                                left: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                                right: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                                insideHorizontal: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                                insideVertical: { style: docx_1.BorderStyle.SINGLE, size: 1 }
                            },
                            rows: [
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            width: {
                                                size: 20,
                                                type: docx_1.WidthType.PERCENTAGE
                                            },
                                            children: [new docx_1.Paragraph('賣方資訊')]
                                        }),
                                        new docx_1.TableCell({
                                            width: {
                                                size: 80,
                                                type: docx_1.WidthType.PERCENTAGE
                                            },
                                            children: [
                                                new docx_1.Paragraph(`名稱：${invoice.sellerName || '測試公司'}`),
                                                new docx_1.Paragraph(`統一編號：${invoice.sellerTaxId || '12345678'}`)
                                            ]
                                        })
                                    ]
                                }),
                                ...(invoice.type === '三聯式' ? [
                                    new docx_1.TableRow({
                                        children: [
                                            new docx_1.TableCell({
                                                width: {
                                                    size: 20,
                                                    type: docx_1.WidthType.PERCENTAGE
                                                },
                                                children: [new docx_1.Paragraph('買方資訊')]
                                            }),
                                            new docx_1.TableCell({
                                                width: {
                                                    size: 80,
                                                    type: docx_1.WidthType.PERCENTAGE
                                                },
                                                children: [
                                                    new docx_1.Paragraph(`名稱：${invoice.buyerName}`),
                                                    new docx_1.Paragraph(`統一編號：${invoice.buyerTaxId}`)
                                                ]
                                            })
                                        ]
                                    })
                                ] : [])
                            ]
                        }),
                        new docx_1.Paragraph({ spacing: { before: (0, docx_1.convertInchesToTwip)(0.5) } }),
                        new docx_1.Table({
                            width: {
                                size: 100,
                                type: docx_1.WidthType.PERCENTAGE
                            },
                            borders: {
                                top: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                                bottom: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                                left: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                                right: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                                insideHorizontal: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                                insideVertical: { style: docx_1.BorderStyle.SINGLE, size: 1 }
                            },
                            rows: [
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            width: {
                                                size: 40,
                                                type: docx_1.WidthType.PERCENTAGE
                                            },
                                            children: [new docx_1.Paragraph({ text: '品名', alignment: docx_1.AlignmentType.CENTER })]
                                        }),
                                        new docx_1.TableCell({
                                            width: {
                                                size: 15,
                                                type: docx_1.WidthType.PERCENTAGE
                                            },
                                            children: [new docx_1.Paragraph({ text: '數量', alignment: docx_1.AlignmentType.CENTER })]
                                        }),
                                        new docx_1.TableCell({
                                            width: {
                                                size: 20,
                                                type: docx_1.WidthType.PERCENTAGE
                                            },
                                            children: [new docx_1.Paragraph({ text: '單價', alignment: docx_1.AlignmentType.CENTER })]
                                        }),
                                        new docx_1.TableCell({
                                            width: {
                                                size: 25,
                                                type: docx_1.WidthType.PERCENTAGE
                                            },
                                            children: [new docx_1.Paragraph({ text: '金額', alignment: docx_1.AlignmentType.CENTER })]
                                        })
                                    ]
                                }),
                                ...invoice.items.map(item => new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            children: [new docx_1.Paragraph(item.description)]
                                        }),
                                        new docx_1.TableCell({
                                            children: [new docx_1.Paragraph({
                                                    text: item.quantity.toString(),
                                                    alignment: docx_1.AlignmentType.RIGHT
                                                })]
                                        }),
                                        new docx_1.TableCell({
                                            children: [new docx_1.Paragraph({
                                                    text: (0, numberUtils_1.formatCurrency)(item.unitPrice),
                                                    alignment: docx_1.AlignmentType.RIGHT
                                                })]
                                        }),
                                        new docx_1.TableCell({
                                            children: [new docx_1.Paragraph({
                                                    text: (0, numberUtils_1.formatCurrency)(item.amount),
                                                    alignment: docx_1.AlignmentType.RIGHT
                                                })]
                                        })
                                    ]
                                }))
                            ]
                        }),
                        new docx_1.Paragraph({
                            alignment: docx_1.AlignmentType.RIGHT,
                            spacing: { before: (0, docx_1.convertInchesToTwip)(0.5) },
                            children: [
                                new docx_1.TextRun({
                                    text: `小計：${(0, numberUtils_1.formatCurrency)(invoice.amount)}`,
                                    size: 24
                                })
                            ]
                        }),
                        new docx_1.Paragraph({
                            alignment: docx_1.AlignmentType.RIGHT,
                            children: [
                                new docx_1.TextRun({
                                    text: `營業稅：${(0, numberUtils_1.formatCurrency)(invoice.taxAmount)}`,
                                    size: 24
                                })
                            ]
                        }),
                        new docx_1.Paragraph({
                            alignment: docx_1.AlignmentType.RIGHT,
                            children: [
                                new docx_1.TextRun({
                                    text: `總計：${(0, numberUtils_1.formatCurrency)(invoice.amount + invoice.taxAmount)}`,
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
    async generateReceiptDoc(receipt) {
        const doc = new docx_1.Document({
            sections: [{
                    properties: {},
                    children: [
                        new docx_1.Paragraph({
                            alignment: docx_1.AlignmentType.CENTER,
                            children: [
                                new docx_1.TextRun({
                                    text: '收據',
                                    size: 32,
                                    bold: true
                                })
                            ]
                        }),
                        new docx_1.Paragraph({
                            alignment: docx_1.AlignmentType.RIGHT,
                            children: [
                                new docx_1.TextRun({
                                    text: `開立日期：${(0, dateUtils_1.formatDate)(receipt.date)}`,
                                    size: 24
                                })
                            ]
                        }),
                        new docx_1.Paragraph({
                            children: [
                                new docx_1.TextRun({
                                    text: `收據號碼：${receipt.receiptNumber}`,
                                    size: 24
                                })
                            ]
                        }),
                        new docx_1.Paragraph({
                            spacing: { before: (0, docx_1.convertInchesToTwip)(0.5) },
                            children: [
                                new docx_1.TextRun({
                                    text: `茲收到 ${receipt.payerName} 繳納`,
                                    size: 24
                                })
                            ]
                        }),
                        new docx_1.Paragraph({
                            spacing: { before: (0, docx_1.convertInchesToTwip)(0.5) },
                            children: [
                                new docx_1.TextRun({
                                    text: `${receipt.description}`,
                                    size: 24,
                                    bold: true
                                })
                            ]
                        }),
                        new docx_1.Paragraph({
                            spacing: { before: (0, docx_1.convertInchesToTwip)(0.5) },
                            children: [
                                new docx_1.TextRun({
                                    text: `新台幣 ${(0, numberUtils_1.formatCurrency)(receipt.amount)} 元整`,
                                    size: 24,
                                    bold: true
                                })
                            ]
                        }),
                        new docx_1.Paragraph({
                            spacing: { before: (0, docx_1.convertInchesToTwip)(2) },
                            alignment: docx_1.AlignmentType.RIGHT,
                            children: [
                                new docx_1.TextRun({
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
    async generateDocument(document) {
        let doc;
        if ('invoiceNumber' in document) {
            doc = await this.generateInvoiceDoc(document);
        }
        else {
            doc = await this.generateReceiptDoc(document);
        }
        return await docx_2.Packer.toBlob(doc);
    }
    async printDocument(doc) {
        try {
            if (doc.type === '收據') {
                // 處理收據列印
                const document = await this.generateReceiptDoc(doc);
                const blob = await docx_2.Packer.toBlob(document);
                (0, file_saver_1.saveAs)(blob, `收據_${doc.receiptNumber}.docx`);
            }
            else {
                // 處理發票列印
                const invoice = doc;
                const pages = invoice.type === '二聯式'
                    ? ['存根聯', '收執聯']
                    : ['存根聯', '報帳聯', '扣抵聯'];
                // 為每一聯產生獨立的文件
                const sections = pages.map(pageType => ({
                    properties: {},
                    children: [
                        new docx_1.Paragraph({
                            pageBreakBefore: true,
                            alignment: docx_1.AlignmentType.CENTER,
                            children: [
                                new docx_1.TextRun({
                                    text: `${invoice.type}發票 - ${pageType}`,
                                    size: 32,
                                    bold: true
                                })
                            ]
                        }),
                        new docx_1.Paragraph({
                            alignment: docx_1.AlignmentType.RIGHT,
                            children: [
                                new docx_1.TextRun({
                                    text: `開立日期：${(0, dateUtils_1.formatDate)(invoice.date)}`,
                                    size: 24
                                })
                            ]
                        }),
                        new docx_1.Paragraph({
                            children: [
                                new docx_1.TextRun({
                                    text: `發票號碼：${invoice.invoiceNumber}`,
                                    size: 24
                                })
                            ]
                        }),
                        new docx_1.Table({
                            width: {
                                size: 100,
                                type: docx_1.WidthType.PERCENTAGE
                            },
                            borders: {
                                top: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                                bottom: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                                left: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                                right: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                                insideHorizontal: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                                insideVertical: { style: docx_1.BorderStyle.SINGLE, size: 1 }
                            },
                            rows: [
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            width: {
                                                size: 20,
                                                type: docx_1.WidthType.PERCENTAGE
                                            },
                                            children: [new docx_1.Paragraph('賣方資訊')]
                                        }),
                                        new docx_1.TableCell({
                                            width: {
                                                size: 80,
                                                type: docx_1.WidthType.PERCENTAGE
                                            },
                                            children: [
                                                new docx_1.Paragraph(`名稱：${invoice.sellerName || '測試公司'}`),
                                                new docx_1.Paragraph(`統一編號：${invoice.sellerTaxId || '12345678'}`)
                                            ]
                                        })
                                    ]
                                }),
                                ...(invoice.type === '三聯式' ? [
                                    new docx_1.TableRow({
                                        children: [
                                            new docx_1.TableCell({
                                                width: {
                                                    size: 20,
                                                    type: docx_1.WidthType.PERCENTAGE
                                                },
                                                children: [new docx_1.Paragraph('買方資訊')]
                                            }),
                                            new docx_1.TableCell({
                                                width: {
                                                    size: 80,
                                                    type: docx_1.WidthType.PERCENTAGE
                                                },
                                                children: [
                                                    new docx_1.Paragraph(`名稱：${invoice.buyerName || ''}`),
                                                    new docx_1.Paragraph(`統一編號：${invoice.buyerTaxId || ''}`)
                                                ]
                                            })
                                        ]
                                    })
                                ] : [])
                            ]
                        }),
                        new docx_1.Paragraph({ spacing: { before: (0, docx_1.convertInchesToTwip)(0.5) } }),
                        new docx_1.Table({
                            width: {
                                size: 100,
                                type: docx_1.WidthType.PERCENTAGE
                            },
                            borders: {
                                top: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                                bottom: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                                left: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                                right: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                                insideHorizontal: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                                insideVertical: { style: docx_1.BorderStyle.SINGLE, size: 1 }
                            },
                            rows: [
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            width: {
                                                size: 40,
                                                type: docx_1.WidthType.PERCENTAGE
                                            },
                                            children: [new docx_1.Paragraph({ text: '品名', alignment: docx_1.AlignmentType.CENTER })]
                                        }),
                                        new docx_1.TableCell({
                                            width: {
                                                size: 15,
                                                type: docx_1.WidthType.PERCENTAGE
                                            },
                                            children: [new docx_1.Paragraph({ text: '數量', alignment: docx_1.AlignmentType.CENTER })]
                                        }),
                                        new docx_1.TableCell({
                                            width: {
                                                size: 20,
                                                type: docx_1.WidthType.PERCENTAGE
                                            },
                                            children: [new docx_1.Paragraph({ text: '單價', alignment: docx_1.AlignmentType.CENTER })]
                                        }),
                                        new docx_1.TableCell({
                                            width: {
                                                size: 25,
                                                type: docx_1.WidthType.PERCENTAGE
                                            },
                                            children: [new docx_1.Paragraph({ text: '金額', alignment: docx_1.AlignmentType.CENTER })]
                                        })
                                    ]
                                }),
                                ...(invoice.items && invoice.items.length > 0 ?
                                    invoice.items.map(item => new docx_1.TableRow({
                                        children: [
                                            new docx_1.TableCell({
                                                children: [new docx_1.Paragraph(item.description)]
                                            }),
                                            new docx_1.TableCell({
                                                children: [new docx_1.Paragraph({
                                                        text: item.quantity.toString(),
                                                        alignment: docx_1.AlignmentType.RIGHT
                                                    })]
                                            }),
                                            new docx_1.TableCell({
                                                children: [new docx_1.Paragraph({
                                                        text: (0, numberUtils_1.formatCurrency)(item.unitPrice),
                                                        alignment: docx_1.AlignmentType.RIGHT
                                                    })]
                                            }),
                                            new docx_1.TableCell({
                                                children: [new docx_1.Paragraph({
                                                        text: (0, numberUtils_1.formatCurrency)(item.amount),
                                                        alignment: docx_1.AlignmentType.RIGHT
                                                    })]
                                            })
                                        ]
                                    })) : [
                                    new docx_1.TableRow({
                                        children: [
                                            new docx_1.TableCell({
                                                children: [new docx_1.Paragraph('會費')]
                                            }),
                                            new docx_1.TableCell({
                                                children: [new docx_1.Paragraph({
                                                        text: '1',
                                                        alignment: docx_1.AlignmentType.RIGHT
                                                    })]
                                            }),
                                            new docx_1.TableCell({
                                                children: [new docx_1.Paragraph({
                                                        text: (0, numberUtils_1.formatCurrency)(invoice.amount),
                                                        alignment: docx_1.AlignmentType.RIGHT
                                                    })]
                                            }),
                                            new docx_1.TableCell({
                                                children: [new docx_1.Paragraph({
                                                        text: (0, numberUtils_1.formatCurrency)(invoice.amount),
                                                        alignment: docx_1.AlignmentType.RIGHT
                                                    })]
                                            })
                                        ]
                                    })
                                ])
                            ]
                        }),
                        new docx_1.Paragraph({
                            alignment: docx_1.AlignmentType.RIGHT,
                            spacing: { before: (0, docx_1.convertInchesToTwip)(0.5) },
                            children: [
                                new docx_1.TextRun({
                                    text: `小計：${(0, numberUtils_1.formatCurrency)(invoice.amount)}`,
                                    size: 24
                                })
                            ]
                        }),
                        new docx_1.Paragraph({
                            alignment: docx_1.AlignmentType.RIGHT,
                            children: [
                                new docx_1.TextRun({
                                    text: `營業稅：${(0, numberUtils_1.formatCurrency)(invoice.taxAmount || 0)}`,
                                    size: 24
                                })
                            ]
                        }),
                        new docx_1.Paragraph({
                            alignment: docx_1.AlignmentType.RIGHT,
                            children: [
                                new docx_1.TextRun({
                                    text: `總計：${(0, numberUtils_1.formatCurrency)(invoice.amount + (invoice.taxAmount || 0))}`,
                                    size: 24,
                                    bold: true
                                })
                            ]
                        })
                    ]
                }));
                // 建立合併後的文件
                const mergedDoc = new docx_1.Document({
                    sections: sections
                });
                const blob = await docx_2.Packer.toBlob(mergedDoc);
                (0, file_saver_1.saveAs)(blob, `發票_${invoice.invoiceNumber}.docx`);
            }
        }
        catch (error) {
            console.error('列印文件失敗:', error);
            throw error;
        }
    }
}
exports.DocumentService = DocumentService;
exports.documentService = new DocumentService();
