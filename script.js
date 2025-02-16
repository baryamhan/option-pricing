        document.addEventListener("DOMContentLoaded", () => {
            const loggedInUser = localStorage.getItem("loggedInUser");
            if (!loggedInUser) {
                alert("Lütfen önce giriş yapın!");
                window.location.href = "index.html";
            } else {
                document.getElementById("username").innerText = loggedInUser;
                loadDataForUser(loggedInUser);
            }
        });

	function activateOptionDescription() {
	    updateOptionDescription();	
	    const descriptionElement = document.getElementById("optionDescription");
	
	    // Eğer opsiyon fiyatı hesaplanmamışsa, uyarı ver
	    if (!document.getElementById("optionPrice").value) {
	        descriptionElement.innerHTML = "Lütfen önce opsiyon fiyatını hesaplayın.";
	        return;
	    }
	
	    // Gerekli değişkenleri al
	    const assetName = document.getElementById("asset").value;
	    const strikePrice = parseFloat(document.getElementById("strike").value).toFixed(2);
	    const expiryDate = document.getElementById("expiry").value;
	    const premium = parseFloat(document.getElementById("optionPrice").value).toFixed(2);
	    const optionType = document.getElementById("optionType").value;
	
	    // Başabaş fiyatını hesapla
	    const breakeven = optionType === "Call" 
	        ? (parseFloat(strikePrice) + parseFloat(premium)).toFixed(2) 
	        : (parseFloat(strikePrice) - parseFloat(premium)).toFixed(2);
	
	    // Senaryoları oluştur
	    const scenario1 = `
	        Senaryo 1: <br>
	        Eğer <b>${assetName}</b> hissesi <b>${expiryDate}</b> tarihinde <b>${strikePrice} TL</b> fiyatından 
	        ${optionType === "Call" ? "düşük" : "yüksek"} ise yatırımcı <b>${premium} TL</b> kadar net kar elde eder.
	    `;
	
	    const scenario2 = `
	        Senaryo 2: <br>
	        Eğer <b>${assetName}</b> hissesi <b>${expiryDate}</b> tarihinde <b>${breakeven} TL</b> fiyatına eşit ise 
	        yatırımcı başta elde ettiği <b>${premium} TL</b> opsiyon primini kaybetse de nette herhangi bir kar veya zararı olmaz.
	    `;
	
	    const scenario3 = `
	        Senaryo 3: <br>
	        Eğer <b>${assetName}</b> hissesi <b>${expiryDate}</b> tarihinde <b>${strikePrice} TL</b> fiyatından 
	        ${optionType === "Call" ? "yüksek" : "düşük"} ise yatırımcı kullanım fiyatıyla fiyat arasındaki fark kadar zarar eder. 
	        Elde ettiği opsiyon primiyle bu zararı sınırlar.
	    `;
	
	    // Açıklama metnini güncelle
	    descriptionElement.innerHTML = `
	        Opsiyonun başabaş fiyatı <b>${breakeven} TL</b>'dir. Buna göre oluşan 3 senaryo aşağıdaki gibidir:<br><br>
	        ${scenario1} <br><br> ${scenario2} <br><br> ${scenario3}
	    `;
	    drawProfitLossChart();
	}


	function drawProfitLossChart() {
	    window.profitLossChart = null;
	    const canvasContainer = document.getElementById('canvasContainer');
	
	    // Önceki canvas'ı sil ve yeniden oluştur
	    const oldCanvas = document.getElementById('profitLossChart');
	    if (oldCanvas) {
	        oldCanvas.remove(); // Eski canvas'ı tamamen kaldır
	    }
	
	    // Yeni canvas oluştur
	    const newCanvas = document.createElement('canvas');
	    newCanvas.id = 'profitLossChart';
	    newCanvas.width = 400;
	    newCanvas.height = 400;
	    canvasContainer.appendChild(newCanvas); // Yeni canvas'ı tekrar ekle
	
	    // Yeni canvas için context al
	    const ctx = newCanvas.getContext('2d');
	
	    // Gerekli değerleri al
	    const strikePrice = parseFloat(document.getElementById("strike").value);
	    const optionType = document.getElementById("optionType").value;
	    const premium = parseFloat(document.getElementById("optionPrice").value); // Hesaplanan opsiyon fiyatı
	
	    // Fiyat seviyelerini belirle (örnek: 10 fiyat seviyesi önce ve sonra)
	    priceLevels = [];
	    for (let i = -10; i <= 10; i++) {
	        priceLevels.push(strikePrice + i * 2); // 2'şer fiyat aralıklarıyla
	    }
	
	    // Kâr/Zarar hesaplama
	    profitLoss = [];
	    profitLoss = priceLevels.map(price => {
	        if (optionType === "Call") {
	            return Math.min(strikePrice - price, 0) + premium; // Call opsiyon formülü
	        } else {
	            return Math.min(price - strikePrice, 0) + premium; // Put opsiyon formülü
	        }
	    });
	
	    // Başabaş noktası
	    const breakeven = optionType === "Call"
	        ? strikePrice + premium // Call için Başabaş = Kullanım fiyatı + Prim
	        : strikePrice - premium; // Put için Başabaş = Kullanım fiyatı - Prim
	
	    // Eğer önceki grafik varsa, önce onu yok et
	    if (window.profitLossChart) {
	        window.profitLossChart.destroy();
	        window.profitLossChart = null; // Değişkeni sıfırla
	    }

	    // Grafik oluştur
	    window.profitLossChart = new Chart(ctx, {
	        type: 'line',
	        data: {
	            labels: priceLevels,
	            datasets: [{
	                label: 'Kâr/Zarar (P&L)',
	                data: profitLoss,
	                borderColor: 'green',
	                borderWidth: 2,
	                fill: false
	            }]
	        },
	        options: {
	            responsive: true,
	            maintainAspectRatio: false,
	            plugins: {
	                annotation: {
	                    annotations: {
	                        breakevenLine: {
	                            type: 'line',
	                            scaleID: 'x',
	                            value: breakeven,
	                            borderColor: 'red',
	                            borderWidth: 2,
	                            label: {
	                                content: 'Başabaş Noktası',
	                                enabled: true,
	                                position: 'top'
	                            }
	                        }
	                    }
	                }
	            },
	            scales: {
	                x: {
	                    title: { display: true, text: 'Dayanak Varlık Fiyatı' }
	                },
	                y: {
	                    title: { display: true, text: 'Kâr/Zarar' }
	                }
	            }
	        }
	    });
	}	    
	function updateOptionDescription() {
	    // Seçili hisse adı
	    const assetElement = document.getElementById("asset");
	    if (!assetElement) return;
	
	    const assetName = assetElement.value;
	
	    // Kullanım fiyatı (2 ondalık basamak)
	    const strikeElement = document.getElementById("strike");
	    if (!strikeElement) return;
	
	    const strikePrice = parseFloat(strikeElement.value).toFixed(2);
	
	    // Call veya Put seçimi
	    const optionTypeElement = document.getElementById("optionType");
	    if (!optionTypeElement) return;
	
	    const optionType = optionTypeElement.value;
	    const action = optionType === "Call" ? "ALMA" : "SATMA";

	    // Vade sonu tarihini al ve gg aaaa yyyy formatına çevir
	    const expiryElement = document.getElementById("expiry");
	    let expiryDateFormatted = "belirtilmemiş"; // Varsayılan metin
	
	    if (expiryElement && expiryElement.value) {
	        const expiryDate = new Date(expiryElement.value);
	        const day = expiryDate.getDate().toString().padStart(2, '0'); // Gün (2 haneli)
	        const month = expiryDate.toLocaleString('tr-TR', { month: 'long' }); // Ay (Tam Ad)
	        const year = expiryDate.getFullYear(); // Yıl
	        expiryDateFormatted = `${day} ${month} ${year}`; // "gg aaaa yyyy" formatında
	    }

	    // Opsiyon fiyatını al (virgülden sonra 2 hane)
	    const optionPriceElement = document.getElementById("optionPrice").value;
	    let optionPriceFormatted = "belirtilmemiş"; // Varsayılan değer
	
	    if (optionPriceElement && optionPriceElement.value) {
	        optionPriceFormatted = parseFloat(optionPriceElement.value).toFixed(2) + " TL";
	    }		
	    // Açıklama metni oluştur
	    const description = `Fiyatladığınız opsiyon yatırımcının <b>${optionPriceFormatted}</b> karşılığında <b>${assetName}</b> hissesini <b>${expiryDateFormatted}</b> tarihinde <b>${strikePrice} TL</b> fiyatıyla <b>${action} HAKKINI</b> kurumumuza satmak istediği anlamına gelmektedir.`;
	
	    // Açıklama metnini ikinci formdaki <p> etiketi içine yaz
	    document.getElementById("optionDescription").innerHTML = description;
	}	
	    
        function loadDataForUser(user) {
            const jsonFile = user === "YBA" 
                ? "https://cdn.jsdelivr.net/gh/baryamhan/option-pricing@main/yba.json"
                : "https://cdn.jsdelivr.net/gh/baryamhan/option-pricing@main/sube.json";

            fetchData(jsonFile);
        }

	function toggleManualSpot() { 
	    const spotInput = document.getElementById("spotPrice");
	    const manualSpotCheckbox = document.getElementById("manualSpot");
	
	    if (manualSpotCheckbox.checked) {
	        spotInput.removeAttribute("readonly");
	    } else {
	        spotInput.setAttribute("readonly", true);
	        spotInput.value = 100; // Varsayılan değere geri döner
	    }
	}
	    
        async function fetchData(jsonFile) {
            try {
                console.log("JSON Yükleniyor:", jsonFile);
                const response = await fetch(jsonFile);
                const data = await response.json();
                populateAssetDropdown(data);
            } catch (error) {
                console.error("JSON verisi çekilemedi:", error);
                alert("Verileri yüklerken hata oluştu. Lütfen konsolu kontrol edin.");
            }
        }

        function populateAssetDropdown(data) {
            const assetDropdown = document.getElementById("asset");
            assetDropdown.innerHTML = ""; 

            data.forEach(item => {
                let option = document.createElement("option");
                option.value = item["Asset"];
                option.textContent = item["Asset"];
                assetDropdown.appendChild(option);
            });

            assetDropdown.addEventListener("change", () => updateAssetDetails(data));
            updateAssetDetails(data);
        }

        function updateAssetDetails(data) {
            const asset = document.getElementById("asset").value;
            const selectedAsset = data.find(item => item["Asset"] === asset);

            if (selectedAsset) {
                document.getElementById("dividend").value = selectedAsset["Dividend"].toFixed(2);
                document.getElementById("interestRate").value = selectedAsset["Interest Rate (%)"];
                document.getElementById("volatility").value = "";

                const excelBaseDate = new Date(1899, 11, 30);
                const properDate = new Date(excelBaseDate.getTime() + selectedAsset["Dividend Date"] * 86400000);
                document.getElementById("dividendDate").value = properDate.toISOString().split('T')[0];
            }
        }

	function calculateDaysToExpiry() {
        const expiryInput = document.getElementById("expiry").value;

        if (!expiryInput) {
            document.getElementById("daysToExpiry").value = "";
            return;
        }

        const expiryDate = new Date(expiryInput);
        const today = new Date();

        // Sadece tarih kısmını al (saat farkları sorun yaratmasın)
        const timeDiff = expiryDate.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
        const daysToExpiry = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (daysToExpiry < 0) {
            alert("Seçilen vade tarihi geçmiş olamaz!");
            document.getElementById("expiry").value = "";
            document.getElementById("daysToExpiry").value = "";
            return;
        }

        document.getElementById("daysToExpiry").value = daysToExpiry;
    }

	function normalCDF(x) {
	    // Standart normal dağılım fonksiyonu (N(x)) için Gauss hata fonksiyonu yaklaşımı
	    const p = 0.3275911;
	    const a1 = 0.254829592;
	    const a2 = -0.284496736;
	    const a3 = 1.421413741;
	    const a4 = -1.453152027;
	    const a5 = 1.061405429;
	
	    const sign = x < 0 ? -1 : 1;
	    const absX = Math.abs(x) / Math.sqrt(2.0);
	    const t = 1.0 / (1.0 + p * absX);
	    
	    // Gauss hata fonksiyonu (erf) için yaklaşım
	    const erfApprox = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
	    
	    return 0.5 * (1.0 + sign * erfApprox);
	}
		    
	function calculateOptionPrice() {
	    const asset = document.getElementById("asset").value;
	    const spotPrice = parseFloat(document.getElementById("spotPrice").value);
	    const daysToExpiry = parseInt(document.getElementById("daysToExpiry").value);
	    const strike = parseFloat(document.getElementById("strike").value);
	    const interestRate = parseFloat(document.getElementById("interestRate").value) / 100;
	
	    // ✅ Call/Put seçimini `select` kutusundan alıyoruz
	    const optionTypeElement = document.getElementById("optionType");
	    if (!optionTypeElement) {
	        alert("Hata: Call/Put seçimi için 'optionType' bulunamadı!");
	        return;
	    }
	    const optionType = optionTypeElement.value;
	
	    if (isNaN(spotPrice) || isNaN(daysToExpiry) || isNaN(strike) || isNaN(interestRate)) {
	        alert("Lütfen tüm alanları eksiksiz doldurun.");
	        return;
	    }
	
	    // ✅ Kullanıcı giriş bilgisine göre doğru JSON dosyasını seçiyoruz
	    const loggedInUser = localStorage.getItem("loggedInUser");
	    const jsonFile = loggedInUser === "YBA"
	        ? "https://cdn.jsdelivr.net/gh/baryamhan/option-pricing@main/yba.json"
	        : "https://cdn.jsdelivr.net/gh/baryamhan/option-pricing@main/sube.json";
	
	    fetch(jsonFile)
	        .then(response => response.json())
	        .then(data => {
	            const selectedAsset = data.find(item => item["Asset"] === asset);
	
	            if (!selectedAsset) {
	                alert("Hata: Seçili dayanak varlık JSON'da bulunamadı!");
	                return;
	            }
	
	            // ✅ 1. ATMVol'ü JSON'dan al
	            const atmVol = selectedAsset["Volatility (%)"] / 100;
			
	            const dividend = selectedAsset["Dividend"];
	            const dividendDate = new Date(document.getElementById("dividendDate").value);
	            const expiryDate = new Date(document.getElementById("expiry").value);
	            const today = new Date();
			
	            document.getElementById("volatility").value = (volatility * 100).toFixed(2);
	
	            // ✅ Eğer temettü tarihi geçmişteyse veya vade sonu tarihinden büyükse temettü verimi = 0
	            let dividendYield = 0;
	            if (dividendDate > today && dividendDate <= expiryDate) {
	                dividendYield = dividend / spotPrice * 365 / daysToExpiry;
	            }
			
	            // ✅ 2. Slope sabit değer olarak -0.05
	            const slope = -0.05;
	
		    // ✅ 2. Curvature'ları tanımla
		    let callcur = selectedAsset["Call Curvature"]
		    let putcur = selectedAsset["Put Curvature"]
			
	            // ✅ 3. Forward fiyatını Euler yöntemiyle hesapla
	            const fwd = spotPrice * Math.exp((interestRate - dividendYield) * (daysToExpiry / 365));
	            
		    // ✅ 4. ln(Strike / Fwd) hesapla
	            let logStrikeFwd = Math.log(strike / fwd);
	
	            // ✅ 5. X değerini bul
	            let X = (fwd > strike) 
	                ? Math.max(logStrikeFwd, -0.5) 
	                : Math.min(logStrikeFwd, 0.5);
	
	            // ✅ 6. Adjusted Volatility hesapla Call/Put'a göre
		    const curvature = optionType === "Call" 
			? callcur 
			: putcur;
	
	            let adjustedVolatility = (atmVol + (slope * X) + (Math.pow(X, 2) * 1.2));
			
		    // ✅ 7. Güncellenmiş volatiliteyi input'a yaz
	            document.getElementById("volatility").value = (adjustedVolatility * 100).toFixed(2);
			
	            // ✅ Vadeye kalan süre yıl cinsinden
	            const T = daysToExpiry / 365;
	
	            // ✅ Temettü düzeltilmiş spot fiyat
	            const adjustedSpotPrice = spotPrice * Math.exp(-dividendYield * T);
	
	            // ✅ Black-Scholes d1 ve d2 hesaplamaları
	            const d1 = (Math.log(adjustedSpotPrice / strike) + (interestRate + (adjustedVolatility ** 2) / 2) * T) / (adjustedVolatility * Math.sqrt(T));
	            const d2 = d1 - adjustedVolatility * Math.sqrt(T);
	
	            let optionPrice;
	
	            if (optionType === "Call") {
	                optionPrice = (adjustedSpotPrice * normalCDF(d1)) - (strike * Math.exp(-interestRate * T) * normalCDF(d2));
	            } else if (optionType === "Put") {
	                optionPrice = (strike * Math.exp(-interestRate * T) * normalCDF(-d2)) - (adjustedSpotPrice * normalCDF(-d1));
	            } else {
	                alert("Hata: Geçersiz opsiyon türü!");
	                return;
	            }
	
	            document.getElementById("optionPrice").value = optionPrice.toFixed(2);
	        })
	
	        .catch(error => {
	            console.error("Hata:", error);
	            alert("Veriler yüklenirken hata oluştu.");
	        });
		activateOptionDescription();
	}
