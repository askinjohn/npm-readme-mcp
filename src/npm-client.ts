import axios from 'axios';
import { marked } from 'marked';
import {
  NpmPackageMetadata,
  ReadmeOutput,
  PackageMetadataOutput,
  NpmSearchResult,
  NpmSearchPackage
} from './types.js'; // Added .js extension

export class NpmClient {
  private readonly baseUrl: string = 'https://registry.npmjs.org';

  /**
   * Fetches package metadata from the npm registry
   * @param packageName The name of the npm package to fetch
   * @returns The package metadata
   */
  async fetchPackageMetadata(packageName: string): Promise<NpmPackageMetadata> {
    try {
      const response = await axios.get<NpmPackageMetadata>(`${this.baseUrl}/${packageName}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Package '${packageName}' not found in npm registry`);
      }
      throw new Error(`Failed to fetch package '${packageName}' from npm registry: ${error}`);
    }
  }

  /**
   * Extracts the README content and optional metadata from package data
   * @param packageData The package metadata from npm
   * @param includeMetadata Whether to include package metadata in the response
   * @returns The README content and optional metadata
   */
  extractReadmeData(
    packageData: NpmPackageMetadata,
    includeMetadata: boolean = false
  ): ReadmeOutput {
  // Extract README content
  let readme = packageData.readme || 'No README found for this package';
  
  // Convert README to HTML - make sure to handle as synchronous call
  const readmeHtml = marked.parse(readme) as string;
  
  // Extract metadata if requested
  let metadata: PackageMetadataOutput | undefined;
    
    if (includeMetadata) {
      const latestVersion = packageData['dist-tags']?.latest;
      const versionData = latestVersion ? packageData.versions[latestVersion] : null;
      
      metadata = {
        name: packageData.name,
        version: latestVersion || 'unknown',
        description: packageData.description || versionData?.description,
        author: packageData.author || versionData?.author,
        license: packageData.license || versionData?.license,
        repository: packageData.repository || versionData?.repository,
        homepage: packageData.homepage || versionData?.homepage,
        keywords: packageData.keywords || versionData?.keywords,
        lastModified: packageData.time?.modified
      };
    }
    
    return {
      name: packageData.name,
      readme,
      readmeHtml,
      metadata
    };
  }

  /**
   * Fetches README for a package
   * @param packageName The name of the npm package
   * @param includeMetadata Whether to include package metadata
   * @returns The README content and optional metadata
   */
  async getPackageReadme(
    packageName: string,
    includeMetadata: boolean = false
  ): Promise<ReadmeOutput> {
    const packageData = await this.fetchPackageMetadata(packageName);
    return this.extractReadmeData(packageData, includeMetadata);
  }

  /**
   * Searches for packages in the npm registry
   * @param options Options including query, author, keywords, limit, sortByPopularity, and popularityWeight
   * @returns Array of search results
   */
  async searchPackages(options: {
    query?: string;
    author?: string;
    keywords?: string[];
    limit?: number;
    sortByPopularity?: boolean;
    popularityWeight?: number;
  }): Promise<NpmSearchPackage[]> {
    try {
      const { 
        query = "", 
        author = "", 
        keywords = [], 
        limit = 10,
        sortByPopularity = true, // Default to sorting by popularity
        popularityWeight = 0.8 // Default weight when sorting
      } = options;
      
      // Build the text part of the search query
      let searchText = query;
      if (author) {
        searchText += ` author:${author}`;
      }
      if (keywords.length > 0) {
        keywords.forEach(keyword => {
          searchText += ` keywords:${keyword}`;
        });
      }
      
      // Configure search parameters using URLSearchParams
      const params = new URLSearchParams();
      params.append('text', searchText.trim());
      params.append('size', limit.toString());
      
      // Configure sorting by popularity if requested
      if (sortByPopularity) {
        // Ensure weight is within bounds 0-1
        const validPopularityWeight = Math.max(0, Math.min(1, popularityWeight));
        // Set popularity as the primary factor
        params.append('popularity', validPopularityWeight.toString());
        // Use remaining weight for quality
        params.append('quality', (1 - validPopularityWeight).toString());
        // Set maintenance to zero to focus sorting on popularity/quality
        params.append('maintenance', '0.0');
      }
      
      // Complete the URL
      const searchUrl = `${this.baseUrl}/-/v1/search?${params.toString()}`;
      
      const response = await axios.get<NpmSearchResult>(searchUrl);
      
      // Transform the response to a more usable format
      return response.data.objects.map(obj => ({
        name: obj.package.name,
        version: obj.package.version,
        description: obj.package.description,
        keywords: obj.package.keywords,
        date: obj.package.date,
        publisher: obj.package.publisher?.username,
        author: obj.package.author,
        links: {
          npm: obj.package.links?.npm,
          homepage: obj.package.links?.homepage,
          repository: obj.package.links?.repository,
          bugs: obj.package.links?.bugs
        },
        score: {
          final: obj.score?.final,
          detail: {
            quality: obj.score?.detail?.quality,
            popularity: obj.score?.detail?.popularity,
            maintenance: obj.score?.detail?.maintenance
          }
        }
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Error searching npm packages: ${error.message}`);
      }
      throw new Error(`Failed to search npm packages: ${error}`);
    }
  }
}
