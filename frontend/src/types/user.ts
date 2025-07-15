export type user = {
  email: string;
  role: string;
  accessToken?: string;
};

export type error = {
  isError: boolean;
  message: string;
};

export type document = {
  id?: number;
  title: string;
  author: string;
  category: string;
  language: string;
  cover: string;
  quantity: any;
  date: string;
  release_date?: string;
  cover_url?: string;
  ISBN: string;
  shelf: string;
  document_url: string;
};

export type borrowing = {
  borrow_date: string;
  email: string;
  title: string;
  quantity: number;
  faculty_id: number;
  data_id: number;
};

export type userBorrowing = {
  renew: number;
  borrow_date: string;
  title: string;
  document_id: number;
};

export type userInfo = {
  id: number;
  faculty_id: number;
  role: string;
  email: string;
};
