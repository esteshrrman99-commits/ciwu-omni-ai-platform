const axios = require('axios');
const xml2js = require('xml2js');

class LiveMedicalDB {
  constructor() {
    this.ncbiBaseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
  }

  // Search PubMed for latest research on a condition
  async searchPubMed(query, maxResults = 5) {
    console.log(`🔍 Searching PubMed for: "${query}"...`);
    
    try {
      // Step 1: Get IDs
      const esearchUrl = `${this.ncbiBaseUrl}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=${maxResults}`;
      const searchRes = await axios.get(esearchUrl);
      const ids = searchRes.data.esearchresult.idlist;

      if (ids.length === 0) return [];

      // Step 2: Get Details (Abstracts)
      const efetchUrl = `${this.ncbiBaseUrl}/efetch.fcgi?id=${ids.join(',')}&db=pubmed&retmode=xml`;
      const fetchRes = await axios.get(efetchUrl);
      
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(fetchRes.data);
      
      const articles = result.PubmedArticleSet.PubmedArticle.map(article => ({
        title: article.MedlineCitation.Article.ArticleTitle[0],
        authors: article.MedlineCitation.Article.AuthorList[0].Author.map(a => a.LastName ? a.LastName[0] + (a.Initials ? ', ' + a.Initials[0] : '') : 'Unknown'),
        journal: article.MedlineCitation.Article.Journal[0].Title[0],
        year: article.MedlineCitation.DateCompleted ? article.MedlineCitation.DateCompleted[0].Year[0] : 'N/A',
        abstract: article.MedlineCitation.Article.Abstract ? (article.MedlineCitation.Article.Abstract[0].AbstractText ? article.MedlineCitation.Article.Abstract[0].AbstractText[0]._ : 'No abstract') : 'No abstract',
        pmid: article.MedlineCitation.PMID[0]
      }));

      return articles;
    } catch (err) {
      console.error('PubMed API Error:', err.message);
      return [];
    }
  }

  // Get clinical trials status
  async getClinicalTrials(condition) {
    console.log(`🏥 Checking ClinicalTrials.gov for: "${condition}"...`);
    try {
      const url = `https://clinicaltrials.gov/api/v2/studies?query.ptTerm=${encodeURIComponent(condition)}&pageSize=3`;
      const res = await axios.get(url);
      return res.data.studies.map(s => ({
        nctId: s.protocolSection.identificationModule.nctId,
        title: s.protocolSection.identificationModule.title,
        phase: s.protocolSection.statusModule.phase || 'Not specified',
        recruitment: s.protocolSection.statusModule.recruitmentStatus || 'Unknown'
      }));
    } catch (err) {
      console.error('Clinical Trials API Error:', err.message);
      return [];
    }
  }
}

module.exports = LiveMedicalDB;
