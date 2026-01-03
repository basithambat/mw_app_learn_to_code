type User = {
    created_at: string; // ISO 8601 Date String
    email: string;
    first_name: string;
    id: string; // UUID
    last_name: string;
    login_through: string;
    name: string;
    password: string | null;
    pic: string; // URL to the user's picture
    role_id: string | null;
    updated_at: string; // ISO 8601 Date String
};

export type AuthPayload = {
    token: string; // JWT token
    user: User;
};
