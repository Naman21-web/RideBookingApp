export interface createVehicleInput {
    userId: String;
    carModel: String;
    carNumber: String;
    color: String;
    capacity: String;
    carType: 'RICKSHAW'|'HATCHBACK'|'SEDAN'|'SUV'|'SEVEN_SEATER';
}

export type VehicleType =
  | 'RICKSHAW'
  | 'HATCHBACK'
  | 'SEDAN'
  | 'SUV'
  | 'SEVEN_SEATER';