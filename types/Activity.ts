interface Article {
    title: string;
    image_url: string;
}

export interface User {
    pic: string;
    name: string;
    email: string;
}

export interface ActivityTypes {
    id: string;
    article_id: string;
    user_id: string;
    parent_id: string | null;
    comment: string;
    created_at: string;
    updated_at: string;
    likes: any[]; // Adjust type if you know the structure of likes
    article: Article;
    user: User;
}