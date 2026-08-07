const axios = require('axios');
const { parseStringPromise } = require('xml2js');

class LiveMedicalDB {
  constructor() {
    this.ncbiApiKey = process.env.NCBI_API_KEY || '';
    this.apiUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
  }

  async searchPubMed(query) {
    try {
      const searchTerm = encodeURIComponent(query);
      const url = `${this.apiUrl}/esearch.fcgi?db=pubmed&term=${searchTerm}&retmode=json&retmax=10${this.ncbiApiKey ? `&api_key=${this.ncbiApiKey}` : ''}`;
      
      const response = await axios.get(url, { timeout: 15000 });
      
      if (!response.data.esearchresult || !response.data.esearchresult.idlist) {
        return [];
      }

      const ids = response.data.esearchresult.idlist;
      const articles = [];

      // Fetch details for each article
      for (const id of ids) {
        try {
          const summaryUrl = `${this.apiUrl}/esummary.fcgi?id=${id}&db=pubmed&retmode=json${this.ncbiApiKey ? `&api_key=${this.ncbiApiKey}` : ''}`;
          const summaryRes = await axios.get(summaryUrl, { timeout: 10000 });
          
          if (summaryRes.data.result[id]) {
            const article = summaryRes.data.result[id];
            articles.push({
              id: article.uid,
              title: article.title,
              authors: article.authorlist ? article.authorlist.map(a => a.name).join(', ') : 'Unknown',
              journal: article.fulljournalname,
              pubDate: article.pubdate,
              abstract: article.abstracttext || 'Abstract not available',
              url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
            });
          }
        } catch(err) {
          // Skip individual failures
        }
      }

      return articles;
    } catch(err) {
      console.error('PubMed search error:', err.message);
      return [];
    }
  }

  async getClinicalTrials(query) {
    try {
      const searchTerm = encodeURIComponent(query);
      const url = `https://clinicaltrials.gov/api/v2/studies?query.cond=${searchTerm}&pageSize=10`;
      
      const response = await axios.get(url, { timeout: 15000 });
      
      if (!response.data.studies || response.data.studies.length === 0) {
        return [];
      }

      return response.data.studies.map(trial => ({
        id: trial.nctId,
        title: trial.protocolSection?.identificationModule?.briefTitle || 'Untitled',
        status: trial.protocolSection?.enrollmentModule?.overallStatus || 'Unknown',
        condition: trial.protocolSection?.conditionsModule?.conditions?.[0] || query,
        url: `https://clinicaltrials.gov/study/${trial.nctId}`,
        phase: trial.protocolSection?.designModule?.studyPhases?.[0] || 'Not specified'
      }));
    } catch(err) {
      console.error('Clinical Trials search error:', err.message);
      return [];
    }
  }
}

module.exports = LiveMedicalDB;
