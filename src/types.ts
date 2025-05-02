// NPM Registry API types

export interface NpmPackageAuthor {
    name: string;
    email: string;
    url?: string;
  }
  
  export interface NpmPackageVersion {
    name: string;
    version: string;
    description?: string;
    author?: NpmPackageAuthor;
    main?: string;
    types?: string;
    license?: string;
    repository?: {
      type: string;
      url: string;
      directory?: string;
    };
    bugs?: {
      url: string;
    };
    homepage?: string;
    keywords?: string[];
    _id?: string;
  }
  
  export interface NpmPackageMetadata {
    _id: string;
    name: string;
    description?: string;
    'dist-tags': {
      [key: string]: string;
    };
    versions: {
      [version: string]: NpmPackageVersion;
    };
    time?: {
      [version: string]: string;
      created: string;
      modified: string;
    };
    author?: NpmPackageAuthor;
    license?: string;
    homepage?: string;
    repository?: {
      type: string;
      url: string;
      directory?: string;
    };
    readme?: string;
    readmeFilename?: string;
    keywords?: string[];
    bugs?: {
      url: string;
    };
    maintainers?: {
      name: string;
      email: string;
    }[];
  }
  
  // NPM Search API Types
  
  export interface NpmSearchPackageLinks {
    npm?: string;
    homepage?: string;
    repository?: string;
    bugs?: string;
  }
  
  export interface NpmSearchPackagePublisher {
    username: string;
    email?: string;
  }
  
  export interface NpmSearchScoreDetail {
    quality?: number;
    popularity?: number;
    maintenance?: number;
  }
  
  export interface NpmSearchScore {
    final?: number;
    detail?: NpmSearchScoreDetail;
  }
  
  export interface NpmSearchPackageObject {
    package: {
      name: string;
      version: string;
      description?: string;
      keywords?: string[];
      date?: string;
      links?: NpmSearchPackageLinks;
      publisher?: NpmSearchPackagePublisher;
      author?: NpmPackageAuthor;
    };
    score?: NpmSearchScore;
    searchScore?: number;
  }
  
  export interface NpmSearchResult {
    objects: NpmSearchPackageObject[];
    total: number;
    time: string;
  }
  
  export interface NpmSearchPackage {
    name: string;
    version: string;
    description?: string;
    keywords?: string[];
    date?: string;
    publisher?: string;
    author?: NpmPackageAuthor;
    links?: NpmSearchPackageLinks;
    score?: NpmSearchScore;
  }
  
  // MCP Types
  
  export interface ReadmeQueryInput {
    packageName: string;
    includeMetadata?: boolean;
  }
  
  export interface SearchQueryInput {
    query: string;
    limit?: number;
  }
  
  export interface PackageMetadataOutput {
    name: string;
    version: string;
    description?: string;
    author?: {
      name: string;
      email?: string;
      url?: string;
    };
    license?: string;
    repository?: {
      url: string;
      type: string;
    };
    homepage?: string;
    keywords?: string[];
    lastModified?: string;
  }
  
  export interface ReadmeOutput {
    name: string;
    readme: string;
    readmeHtml: string;
    metadata?: PackageMetadataOutput;
  }
  
  export interface SearchOutput {
    packages: NpmSearchPackage[];
    total: number;
    query: string;
  }