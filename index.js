let info = item.productInsure;
            //console.log('info',item)
            minPremiumLimit = info.minPremiumLimit ? parseFloat(info.minPremiumLimit) : 0;
            maxPremiumLimit = info.maxPremiumLimit ? parseFloat(info.maxPremiumLimit) : 0;
            // 记录最低保额与最高保额
            //item.productInsure.
            if (info.premiumAddType == 2) {
                maxPremiumLimit = 999999999;
            } else if (info.premiumAddType == 1 && info.singleCoverage) {
                minPremiumLimit = parseInt(info.minPolicyNum) * parseFloat(info.singleCoverage);
                maxPremiumLimit = parseInt(info.maxPolicyNum) * parseFloat(info.singleCoverage);
            }
            //保额类型 判断
            let amountStatus2 = '';
            /* if(info.singleCoverage){
                amountStatus2 = '1'
            }else if(maxPremiumLimit){
                amountStatus2 = '0'
            }else if(!this.state.defaultAmount){
                amountStatus2 = null;
            } */
            if(!this.state.defaultAmount){
                amountStatus2 = null;
            }else if(info.singleCoverage){
                amountStatus2 = '1'
            }else if(maxPremiumLimit){
                amountStatus2 = '0'
            }
            console.log("amountStatus2::",amountStatus2)
            _list.push({
                id: item.id,
                businessCode: item.businessCode,
                productCategory: item.productCategory,
                productCode: item.productCode,
                productName: item.productName,
                productType: item.productType,
                productNature: item.productNature,
                productState: item.productState,
                saleChannel: item.saleChannel,
                salesProductCode: item.salesProductCode,
                saleStateMark: item.saleStateMark,
                minPremiumLimit: isNaN(minPremiumLimit) ? '' : minPremiumLimit,
                maxPremiumLimit: maxPremiumLimit,
                amount: info.singleCoverage,
                //amountStatus: info.singleCoverage ? '1' : '0',
                amountStatus: amountStatus2,
                paymentYears: item.mulits && item.mulits.paymentYears, //缴费年限
                paymentType: item.mulits && item.mulits.paymentType, //缴费年限
                guaranteedValue: item.mulits && item.mulits.guaranteedValue //保障年限
            });