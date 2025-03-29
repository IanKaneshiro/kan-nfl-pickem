type Game = {
  id: string;
  scheduled: string;
  status: string;
  home: {
    id: string;
    name: string;
    alias: string;
  };
  away: {
    id: string;
    name: string;
    alias: string;
  };
  venue: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
};
