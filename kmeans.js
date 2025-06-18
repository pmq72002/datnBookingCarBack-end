const express = require('express');
const kmeans = require('ml-kmeans');  // Gọi hàm kmeans từ ml-kmeans
const fs = require('fs');

const app = express();
const port = 8080;
const peakHoursMapping = {
    'Morning': 0,    
    'Afternoon': 1,  
    'Evening': 2     
};
// Dữ liệu giả định 
const data = [
    { area: 'Ba Đình', population: 226315, trafficDensity: 7000, peakHours: 'Morning', "latitude": 21.03587000 , "longitude": 105.82163000 },
    { area: 'Cầu Giấy', population: 294235, trafficDensity: 7500, peakHours: 'Morning', "latitude": 21.034481105889583, "longitude":105.79232545388217 },
    { area: 'Hoàn Kiếm', population: 141687, trafficDensity: 8000, peakHours: 'Morning', "latitude": 21.030927326947985, "longitude":105.85465786150633 },
    { area: 'Hai Bà Trưng', population: 304101, trafficDensity: 7000, peakHours: 'Morning', "latitude": 21.008483307182715,"longitude": 105.85705942473847 },
    { area: 'Hoàng Mai', population: 540732, trafficDensity: 9000, peakHours: 'Afternoon', "latitude": 20.97821822457275,"longitude": 105.8549853573415 },
    { area: 'Đống Đa', population: 376709, trafficDensity: 6000, peakHours: 'Afternoon', "latitude": 21.0181463164228,"longitude": 105.82826209193549 },
    { area: 'Tây Hồ', population: 167851, trafficDensity: 5500, peakHours: 'Morning', "latitude": 21.080678869336605, "longitude": 105.81122029060487},
    { area: 'Thanh Xuân', population: 293292, trafficDensity: 7000, peakHours: 'Morning', "latitude": 20.99703003772091,"longitude": 105.81550015646395 },
    { area: 'Bắc Từ Liêm', population: 354364, trafficDensity: 6000, peakHours: 'Afternoon', "latitude": 21.068366901811856,"longitude": 105.76541400721648 },
    { area: 'Hà Đông', population: 382637, trafficDensity: 6500, peakHours: 'Evening', "latitude": 20.957543767951123,"longitude": 105.7632956156826 },
    { area: 'Long Biên', population: 337982, trafficDensity: 5500, peakHours: 'Morning', "latitude": 21.043078555666053,"longitude": 105.90179890730909 },
    { area: 'Nam Từ Liêm', population: 282444, trafficDensity: 5700, peakHours: 'Afternoon', "latitude": 21.011561229421837,"longitude": 105.76262931893416},
    { area: 'Chương Mỹ', population: 347564, trafficDensity: 4500, peakHours: 'Afternoon', "latitude": 20.920490277844646,"longitude": 105.7039403351986 },
    { area: 'Đan Phượng', population: 185653, trafficDensity: 3000, peakHours: 'Afternoon', "latitude": 21.089840402851653,"longitude": 105.66949350166723},
    { area: 'Đông Anh', population: 437308, trafficDensity: 5000, peakHours: 'Morning', "latitude": 21.145267470593005,"longitude": 105.8443310237667 },
    { area: 'Gia Lâm', population: 292943, trafficDensity: 4800, peakHours: 'Morning', "latitude": 21.026681100988608,"longitude": 105.96217748024849},
    { area: 'Hoài Đức', population: 257633, trafficDensity: 4500, peakHours: 'Afternoon', "latitude": 21.029106281153176,"longitude": 105.69974648698528 },
    { area: 'Mê Linh', population: 241633, trafficDensity: 4000, peakHours: 'Morning', "latitude": 21.17807839990104,"longitude": 105.70868183777569},
    { area: 'Phú Xuyên', population: 229847, trafficDensity: 5000, peakHours: 'Morning', "latitude": 20.716321499166266,"longitude": 105.89834064734896},
    { area: 'Phúc Thọ', population: 194754, trafficDensity: 6000, peakHours: 'Evening', "latitude": 21.086563487230553,"longitude": 105.62573712483675},
    { area: 'Quốc Oai', population: 203079, trafficDensity: 4000, peakHours: 'Afternoon', "latitude": 20.999350670361466, "longitude": 105.63612548771746 },
    { area: 'Thạch Thất', population: 223844, trafficDensity: 5000, peakHours: 'Afternoon', "latitude": 21.015924474175762,"longitude": 105.52337155155129},
    { area: 'Thanh Oai', population: 227541, trafficDensity: 4000, peakHours: 'Morning', "latitude": 20.865962034934636,"longitude": 105.78226646826553 },
    { area: 'Thanh Trì', population: 288839, trafficDensity: 5700, peakHours: 'Afternoon', "latitude": 20.935682614424767,"longitude": 105.83963371892257},
    { area: 'Thường Tín', population: 262222, trafficDensity: 4500, peakHours: 'Morning', "latitude": 20.871022330773137,"longitude": 105.86195106297885},


];

// Kiểm tra số lượng điểm dữ liệu
const numPoints = data.length;
let k = 2; // Giá trị k, số cụm muốn phân

// Đảm bảo k không vượt quá số lượng điểm dữ liệu
if (k > numPoints) {
    console.log(`Lỗi: Số lượng cụm k (${k}) không thể lớn hơn số điểm dữ liệu (${numPoints}). Đặt k = ${numPoints}`);
    k = numPoints;  // Điều chỉnh k thành số điểm dữ liệu nếu k lớn hơn số lượng điểm dữ liệu
}

// Chuyển đổi dữ liệu để phù hợp với K-means 
const trafficData = data.map(item => [
    item.population, 
    item.trafficDensity,
    peakHoursMapping[item.peakHours]
]);


// Route phân cụm

    // Phân cụm với K-means và số cụm k (đảm bảo k không vượt quá số điểm dữ liệu)
    const result = kmeans(trafficData,  k );
    console.log('Kết quả phân cụm (clusters):', result.clusters);

// Tạo mảng các cụm và phân loại các điểm dữ liệu vào cụm tương ứng
const clustersResult = [];

for (let i = 0; i < k; i++) {
    const clusterInfo = {
        clusterNumber: i + 1,  // Đánh số các cụm bắt đầu từ 1
        points: []
    };

    // Lặp qua tất cả các điểm dữ liệu và phân loại chúng vào các cụm
    result.clusters.forEach((clusterId, pointIndex) => {
        if (clusterId === i) {
            clusterInfo.points.push({
                area: data[pointIndex].area,
                population: data[pointIndex].population,
                trafficDensity: data[pointIndex].trafficDensity,
                peakHours: data[pointIndex].peakHours
            });
        }
    });

    // Thêm thông tin của cụm vào kết quả
    clustersResult.push(clusterInfo);
}

// In kết quả phân cụm
console.log(clustersResult);

// Lưu kết quả phân cụm vào tệp JSON
fs.writeFileSync('clusters_region.json', JSON.stringify(clustersResult, null, 2));

app.get('/clustering', (req, res) => {
    fs.readFile('clusters_region.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Không thể đọc tệp JSON' });
        } else {
            res.header("Content-Type", "application/json");
            res.send(data);
        }
    });
});

// Lắng nghe yêu cầu từ client
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
