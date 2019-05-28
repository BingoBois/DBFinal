export interface CitiesFromBook{
    name: string,
    latitude: string,
    longitude: string
}

export interface AuthorsForBook{
    title: string;
    authors: string[];
}


export interface IHashAuthors{
    [title: string]: string[];
}
