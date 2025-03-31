// Service for fetching and processing CAFB data

// Fetch food distribution sites
export const fetchFoodSites = async () => {
    try {
      // In production, this would call an API
      // For now, we'll use sample data
      const response = await fetch('/data/food-distribution-sites.json');
      if (!response.ok) {
        throw new Error('Failed to fetch food distribution sites');
      }
      
      const data = await response.json();
      return data.sites;
    } catch (error) {
      console.error('Error fetching food sites:', error);
      throw error;
    }
  };
  
  // Get relevant context for RAG approach
  export const getRelevantContext = async (query, userLocation) => {
    try {
      // Fetch all sites
      const allSites = await fetchFoodSites();
      
      // If we have user location, sort by proximity
      let relevantSites = allSites;
      if (userLocation) {
        relevantSites = sortSitesByDistance(
          allSites, 
          userLocation.latitude, 
          userLocation.longitude
        ).slice(0, 10); // Get 10 closest sites
      }
      
      // Extract keywords from query
      const keywords = extractKeywords(query);
      
      // Filter based on query keywords if any
      if (keywords.length > 0) {
        relevantSites = filterSitesByKeywords(relevantSites, keywords);
      }
      
      // Format sites as context
      return formatSitesAsContext(relevantSites);
    } catch (error) {
      console.error('Error getting relevant context:', error);
      return '';
    }
  };
  
  // Extract keywords from query
  const extractKeywords = (query) => {
    // Simple keyword extraction - in production would use NLP
    const lowercaseQuery = query.toLowerCase();
    const keywords = [];
    
    // Food type keywords
    const foodTypes = ['vegetables', 'fruits', 'meat', 'dairy', 'gluten-free', 'halal', 'kosher', 'vegetarian'];
    foodTypes.forEach(type => {
      if (lowercaseQuery.includes(type)) {
        keywords.push(type);
      }
    });
    
    // Schedule keywords
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    days.forEach(day => {
      if (lowercaseQuery.includes(day)) {
        keywords.push(day);
      }
    });
    
    // Time keywords
    const times = ['morning', 'afternoon', 'evening', 'night'];
    times.forEach(time => {
      if (lowercaseQuery.includes(time)) {
        keywords.push(time);
      }
    });
    
    return keywords;
  };
  
  // Filter sites by keywords
  const filterSitesByKeywords = (sites, keywords) => {
    if (keywords.length === 0) return sites;
    
    return sites.filter(site => {
      return keywords.some(keyword => {
        // Check if keyword matches food types
        if (site.foodTypes && site.foodTypes.some(type => type.toLowerCase().includes(keyword))) {
          return true;
        }
        
        // Check if keyword matches schedule
        if (site.schedule && site.schedule.toLowerCase().includes(keyword)) {
          return true;
        }
        
        // Check if keyword matches description
        if (site.description && site.description.toLowerCase().includes(keyword)) {
          return true;
        }
        
        return false;
      });
    });
  };
  
  // Format sites as context string for AI
  const formatSitesAsContext = (sites) => {
    return sites.map(site => {
      return `
  Site: ${site.name}
  Address: ${site.address}
  Hours: ${site.schedule}
  Food Types: ${site.foodTypes ? site.foodTypes.join(', ') : 'Various'}
  Services: ${site.services ? site.services.join(', ') : 'Food distribution'}
  Requirements: ${site.requirements || 'None specified'}
  Description: ${site.description || ''}
      `.trim();
    }).join('\n\n');
  };
  
  // Helper functions
  import { sortSitesByDistance } from '../utils/locationUtils';