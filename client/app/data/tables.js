define([], function () {
  return {
    tables: [
      {
        "name": "Pacesetter Procurement Measure",
        "element": "pacesetter-measure-hot",
        "hot_parameters": {
          "rowHeaderWidth": 200,
          "height": 425
        },
        "rows": [
          {
            "key": "DollarAmtLocal",
            "label": "Dollar Amount Spent with Local MBEs"
          },{
            "key": "DollarAmt",
            "label": "Dollar Amount Spent with MBEs"
          },{
            "key": "TotalAmt",
            "label": "Total Dollar Amount Spent Procuring All Goods and Services"
          },{
            "key": "AverageSpent",
            "label": "Average Spent per Local MBE"
          }, {
            "key": "NumContracted",
            "label": "Number of Local MBEs Contracted"
          }
        ],
        "cols": [
          [
            {
              "label": "Value",
              "key": "value"
            }
          ]
        ],
        "types": [
          {
            "range": {
              "row": "*",
              "col": "*"
            },
            "type": "int",
            "min": 0,
            "max_warning": 10000,
            "empty": false,
            "validators": [
              "discrepancies"
            ]
          }
        ],
        "excel": [
          {
            "sheet": "Pacesetters",
            "start": "B7",
            "end": "Q16",
            "firstrow": "Dollar Amount Spent with Local MBEs"
          }
        ],
        "tooltips": [
          {
            "range": {
              "row": "*",
              "col": "*"
              // "col": "0-2-4-6-8-10-12-14"
            },
            "tooltip": {
              // "//promptTitle": "Number of Female Employees",
              // "//prompt": "Please input the total number of female employees in this race/ethnicity and job category.",
              // "errorTitle": "Invalid Data Entry",
              // "error": "Please do not input any text or leave any cells blank. If the value is zero, please input zero.",
              // "warningTitle": "Warning: Data is too big",
              // "warning": "Are you sure this value is correct?"
            }
          },
          {
            "range": {
              "row": "*",
              "col": "*"
              // "col": "1-3-5-7-9-11-13-15"
            },
            "tooltip": {
              // "//promptTitle": "Number of Male Employees",
              // "//prompt": "Please input the total number of male employees in this race/ethnicity and job category.",
              // "errorTitle": "Invalid Data Entry",
              // "error": "Please do not input any text or leave any cells blank. If the value is zero, please input zero.",
              // "warningTitle": "Warning: Data is too big",
              // "warning": "Are you sure this value is correct?"
            }
          }
        ]
      }
    ]

  }
});