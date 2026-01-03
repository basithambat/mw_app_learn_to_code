import React, { createContext, useContext, useState, useEffect } from 'react';

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  fullContent: string;
  imageUrl: string;
  date: string;
}

interface NewsContextType {
  news: NewsItem[];
  getNewsById: (id: string) => NewsItem | undefined;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const useNews = () => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};

export const NewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    // Simulating API call
    const fetchNews = async () => {
      // Replace this with actual API call
      const dummyNews: NewsItem[] = [
        {
          id: '1',
          title: 'Sample News 1',
          content: 'This is a sample news content...',
          fullContent: 'This is the full content of sample news 1...',
          imageUrl: 'https://via.placeholder.com/300',
          date: '2023-08-31',
        },
        {
          id: '2',
          title: 'Sample News 1',
          content: 'This is a sample news content...',
          fullContent: 'This is the full content of sample news 1...',
          imageUrl: 'https://via.placeholder.com/300',
          date: '2023-08-31',
        },
        {
          id: '3',
          title: 'Sample News 1',
          content: 'This is a sample news content...',
          fullContent: 'This is the full content of sample news 1...',
          imageUrl: 'https://via.placeholder.com/300',
          date: '2023-08-31',
        },
        // Add more dummy news items
      ];
      setNews(dummyNews);
    };

    fetchNews();
  }, []);

  const getNewsById = (id: string) => news.find(item => item.id === id);

  return (
    <NewsContext.Provider value={{ news, getNewsById }}>
      {children}
    </NewsContext.Provider>
  );
};