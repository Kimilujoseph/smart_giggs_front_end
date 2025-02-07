export type User = {
    id: string;
    name: string;
    role: string;
    email:string;
    phone: string;
    profileimage: string | File | null;
    workingstatus: string;
}
