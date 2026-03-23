export interface createUserInput {
    name: String;
    email: String;
    phone: String;
    role: 'RIDER' | 'DRIVER';
}