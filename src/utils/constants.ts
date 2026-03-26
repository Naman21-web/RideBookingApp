export const STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORISED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    GONE: 410,
    UNPROCESSABLE: 422,
    INTERNAL_SERVER_ERROR: 500
}

export const PRICING = {
  RICKSHAW: { baseFare: 30, perKm: 10 },
  HATCHBACK: { baseFare: 50, perKm: 12 },
  SEDAN: { baseFare: 70, perKm: 15 },
  SUV: { baseFare: 100, perKm: 18 },
  SEVEN_SEATER: { baseFare: 120, perKm: 20 },
};