
import { DeliveryRecord, SchemaConfig } from './types';

export const DEFAULT_SCHEMA: SchemaConfig = {
    dateColumn: 'customerPlacedOrderDate',
    timeColumn: 'customerPlacedOrderTime',
    regionColumn: 'deliveryRegion',
    totalTimeColumn: 'totalDeliveryTimeMinutes',
    orderTotalColumn: 'orderTotal',
    refundAmountColumn: 'refundedAmount',
    restaurantIdColumn: 'restaurantId',
    driverIdColumn: 'driverId',
    prepTimeColumn: 'prepTimeMinutes',
    driveTimeColumn: 'driveTimeMinutes'
};

const BASE_RECORDS: DeliveryRecord[] = [
  {
    id: '1',
    customerPlacedOrderDate: '2023-10-27',
    customerPlacedOrderTime: '2:52:12 AM',
    orderWithRestaurantTime: '03:00:00',
    driverAtRestaurantTime: '03:08:09',
    deliveredToConsumerDate: '2023-10-27',
    deliveredToConsumerTime: '3:35:20 AM',
    totalDeliveryTimeMinutes: 43.1,
    driverId: '279',
    restaurantId: '50',
    consumerId: '6738',
    deliveryRegion: 'Mountain View',
    isAsap: true,
    orderTotal: 16.33,
    amountOfDiscount: 0,
    percentDiscount: 0,
    amountOfTip: 0.82,
    percentTip: 0.05,
    refundedAmount: 0,
    refundPercentage: 0,
  },
  {
    id: '13',
    customerPlacedOrderDate: '2023-10-27',
    customerPlacedOrderTime: '3:58:57 PM',
    orderWithRestaurantTime: '18:15:00',
    driverAtRestaurantTime: '18:24:39',
    deliveredToConsumerDate: '2023-10-27',
    deliveredToConsumerTime: '6:57:01 PM',
    totalDeliveryTimeMinutes: 178.1,
    driverId: '303',
    restaurantId: '96',
    consumerId: '64746',
    deliveryRegion: 'Palo Alto',
    isAsap: true,
    orderTotal: 76.14,
    amountOfDiscount: 0,
    percentDiscount: 0,
    amountOfTip: 6.45,
    percentTip: 0.08,
    refundedAmount: 0,
    refundPercentage: 0,
  },
  {
    id: '17',
    customerPlacedOrderDate: '2023-10-27',
    customerPlacedOrderTime: '7:02:37 PM',
    orderWithRestaurantTime: '19:10:00',
    driverAtRestaurantTime: '19:19:59',
    deliveredToConsumerDate: '2023-10-27',
    deliveredToConsumerTime: '7:31:09 PM',
    totalDeliveryTimeMinutes: 28.5,
    driverId: '212',
    restaurantId: '190',
    consumerId: '12484',
    deliveryRegion: 'San Jose',
    isAsap: true,
    orderTotal: 16.77,
    amountOfDiscount: 6,
    percentDiscount: 0.36,
    amountOfTip: 2.52,
    percentTip: 0.15,
    refundedAmount: 0,
    refundPercentage: 0,
  },
  {
    id: '12',
    customerPlacedOrderDate: '2023-10-27',
    customerPlacedOrderTime: '4:01:57 AM',
    orderWithRestaurantTime: '04:10:00',
    driverAtRestaurantTime: '04:13:02',
    deliveredToConsumerDate: '2023-10-27',
    deliveredToConsumerTime: '4:37:57 AM',
    totalDeliveryTimeMinutes: 36.0,
    driverId: '352',
    restaurantId: '194',
    consumerId: '13920',
    deliveryRegion: 'San Jose',
    isAsap: true,
    orderTotal: 25.03,
    amountOfDiscount: 0,
    percentDiscount: 0,
    amountOfTip: 5.00,
    percentTip: 0.20,
    refundedAmount: 0,
    refundPercentage: 0,
  },
  {
    id: '8',
    customerPlacedOrderDate: '2023-10-26',
    customerPlacedOrderTime: '11:46:38 PM',
    orderWithRestaurantTime: '23:50:00',
    driverAtRestaurantTime: '23:54:29',
    deliveredToConsumerDate: '2023-10-27',
    deliveredToConsumerTime: '12:37:15 AM',
    totalDeliveryTimeMinutes: 50.6,
    driverId: '313',
    restaurantId: '9',
    consumerId: '7037',
    deliveryRegion: 'Palo Alto',
    isAsap: true,
    orderTotal: 51.57,
    amountOfDiscount: 0,
    percentDiscount: 0,
    amountOfTip: 5.16,
    percentTip: 0.10,
    refundedAmount: 0,
    refundPercentage: 0,
  },
  {
    id: '12b',
    customerPlacedOrderDate: '2023-10-27',
    customerPlacedOrderTime: '3:54:30 AM',
    orderWithRestaurantTime: '04:00:00',
    driverAtRestaurantTime: '04:10:26',
    deliveredToConsumerDate: '2023-10-27',
    deliveredToConsumerTime: '4:41:00 AM',
    totalDeliveryTimeMinutes: 46.5,
    driverId: '314',
    restaurantId: '350',
    consumerId: '95392',
    deliveryRegion: 'Palo Alto',
    isAsap: true,
    orderTotal: 16.17,
    amountOfDiscount: 6,
    percentDiscount: 0.37,
    amountOfTip: 0.93,
    percentTip: 0.06,
    refundedAmount: 0,
    refundPercentage: 0,
  }
];

const generateSyntheticData = (base: DeliveryRecord[], count: number): DeliveryRecord[] => {
    const synthetic: DeliveryRecord[] = [...base];
    const regions = ['Mountain View', 'Palo Alto', 'San Jose', 'Sunnyvale', 'Santa Clara', 'Redwood City'];
    
    for (let i = 0; i < count; i++) {
        const template = base[i % base.length];
        const randomFactor = Math.random();
        
        // Perturb values
        const newTotal = Math.max(5, Number(template.orderTotal) + (Math.random() * 40 - 10));
        const newTime = Math.max(15, Number(template.totalDeliveryTimeMinutes) + (Math.random() * 30 - 10));
        const newRefund = randomFactor > 0.9 ? Math.random() * 50 : 0; // 10% chance of refund
        const region = regions[Math.floor(Math.random() * regions.length)];
        
        // Randomize time slightly
        let h = Math.floor(Math.random() * 24);
        let m = Math.floor(Math.random() * 60);
        const timeStr = `${h > 12 ? h-12 : (h===0?12:h)}:${String(m).padStart(2,'0')}:${String(Math.floor(Math.random()*60)).padStart(2,'0')} ${h>=12?'PM':'AM'}`;

        synthetic.push({
            ...template,
            id: `${2000 + i}`,
            driverId: `${300 + Math.floor(Math.random() * 100)}`,
            restaurantId: `${10 + Math.floor(Math.random() * 50)}`,
            deliveryRegion: region,
            orderTotal: Number(newTotal.toFixed(2)),
            totalDeliveryTimeMinutes: Number(newTime.toFixed(1)),
            refundedAmount: Number(newRefund.toFixed(2)),
            customerPlacedOrderTime: timeStr,
            // Vary date between today and yesterday
            customerPlacedOrderDate: i % 3 === 0 ? '2023-10-26' : '2023-10-27',
            // Rough estimate for prep/drive split
            prepTimeMinutes: Number((newTime * (0.2 + Math.random() * 0.2)).toFixed(1)),
            driveTimeMinutes: Number((newTime * (0.5 + Math.random() * 0.3)).toFixed(1))
        });
    }
    
    return synthetic;
};

export const INITIAL_DATA: DeliveryRecord[] = generateSyntheticData(BASE_RECORDS, 144);
