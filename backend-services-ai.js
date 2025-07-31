const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');
const OpenAI = require('openai');
const pdfParse = require('pdf-parse');
const tesseract = require('node-tesseract-ocr');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Greek language tokenizer
const greekTokenizer = new natural.WordTokenizer();
const greekStemmer = natural.PorterStemmer;

class AIService {
  constructor() {
    this.documentClassifier = null;
    this.outcomePredictor = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Load pre-trained models if they exist
      await this.loadModels();
      this.initialized = true;
      console.log('AI Service initialized successfully');
    } catch (error) {
      console.error('AI Service initialization error:', error);
    }
  }

  // Document Classification
  async classifyDocument(filePath, mimeType) {
    try {
      let text = '';
      
      // Extract text based on file type
      if (mimeType === 'application/pdf') {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);
        text = data.text;
      } else if (mimeType.startsWith('image/')) {
        // OCR for images
        text = await tesseract.recognize(filePath, {
          lang: 'ell', // Greek
          oem: 1,
          psm: 3
        });
      } else {
        text = await fs.readFile(filePath, 'utf8');
      }
      
      // Clean and tokenize text
      const tokens = greekTokenizer.tokenize(text.toLowerCase());
      
      // Use AI to classify
      const classification = await this.classifyWithGPT(text);
      
      // Extract key information
      const extraction = await this.extractKeyInfo(text, classification.type);
      
      return {
        type: classification.type,
        confidence: classification.confidence,
        category: classification.category,
        extractedData: extraction,
        keywords: this.extractKeywords(tokens),
        summary: await this.generateSummary(text),
        suggestedActions: classification.suggestedActions
      };
    } catch (error) {
      console.error('Document classification error:', error);
      throw error;
    }
  }

  async classifyWithGPT(text) {
    const prompt = `
    Αναλύστε το ακόλουθο νομικό έγγραφο και ταξινομήστε το:
    
    Κείμενο: ${text.substring(0, 2000)}...
    
    Απαντήστε σε JSON με:
    1. type: τύπος εγγράφου (αγωγή, ανακοπή, απόφαση, συμβόλαιο, επιστολή, κλπ)
    2. category: κατηγορία υπόθεσης (αστική, ποινική, εργατική, εμπορική, κλπ)
    3. confidence: βαθμός βεβαιότητας (0-1)
    4. suggestedActions: προτεινόμενες ενέργειες
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  }

  async extractKeyInfo(text, documentType) {
    const prompts = {
      'αγωγή': 'Εξάγετε: ενάγων, εναγόμενος, αιτούμενο ποσό, νομική βάση, δικαστήριο',
      'ανακοπή': 'Εξάγετε: ανακόπτων, καθού, προσβαλλόμενη πράξη, λόγοι ανακοπής, προθεσμία',
      'απόφαση': 'Εξάγετε: αριθμός απόφασης, δικαστήριο, διάδικοι, διατακτικό, αιτιολογία',
      'συμβόλαιο': 'Εξάγετε: συμβαλλόμενοι, αντικείμενο, αμοιβή, διάρκεια, όροι'
    };

    const prompt = prompts[documentType] || 'Εξάγετε τα κύρια στοιχεία του εγγράφου';

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'user',
        content: `${prompt}\n\nΚείμενο: ${text.substring(0, 3000)}`
      }]
    });

    return response.choices[0].message.content;
  }

  // Case Outcome Prediction
  async predictOutcome(caseData) {
    try {
      // Prepare features
      const features = this.prepareCaseFeatures(caseData);
      
      // Use ML model for basic prediction
      const mlPrediction = await this.predictWithML(features);
      
      // Enhance with GPT analysis
      const gptAnalysis = await this.analyzeWithGPT(caseData);
      
      return {
        probability: {
          success: mlPrediction.success,
          partial: mlPrediction.partial,
          failure: mlPrediction.failure
        },
        factors: gptAnalysis.factors,
        similarCases: await this.findSimilarCases(caseData),
        recommendations: gptAnalysis.recommendations,
        estimatedDuration: gptAnalysis.estimatedDuration,
        estimatedCost: gptAnalysis.estimatedCost
      };
    } catch (error) {
      console.error('Outcome prediction error:', error);
      throw error;
    }
  }

  prepareCaseFeatures(caseData) {
    return {
      courtType: caseData.court.type,
      courtLevel: caseData.court.level,
      caseType: caseData.type,
      claimAmount: caseData.financialClaim || 0,
      hasLegalRepresentation: true,
      previousRulings: caseData.previousRulings || 0,
      documentCount: caseData.documents?.length || 0,
      deadlinesMet: caseData.deadlinesMet || true
    };
  }

  async predictWithML(features) {
    // Simple prediction logic (to be replaced with trained model)
    const baseSuccess = 0.5;
    let modifier = 0;
    
    if (features.hasLegalRepresentation) modifier += 0.1;
    if (features.deadlinesMet) modifier += 0.1;
    if (features.documentCount > 10) modifier += 0.05;
    
    const success = Math.min(0.9, Math.max(0.1, baseSuccess + modifier));
    
    return {
      success: success,
      partial: 0.2,
      failure: 1 - success - 0.2
    };
  }

  async analyzeWithGPT(caseData) {
    const prompt = `
    Αναλύστε την ακόλουθη νομική υπόθεση:
    
    Τύπος: ${caseData.type}
    Δικαστήριο: ${caseData.court.name}
    Περιγραφή: ${caseData.description}
    
    Παρακαλώ αξιολογήστε:
    1. Παράγοντες που επηρεάζουν την έκβαση
    2. Συστάσεις για τη βελτίωση των πιθανοτήτων επιτυχίας
    3. Εκτιμώμενη διάρκεια διαδικασίας
    4. Εκτιμώμενο κόστος
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    });

    return this.parseGPTResponse(response.choices[0].message.content);
  }

  // Smart Deadline Suggestions
  async suggestDeadlines(caseType, courtDate, documentType) {
    const suggestions = [];
    
    // Legal deadlines based on Greek Civil Procedure Code
    const legalDeadlines = {
      'ανακοπή 632 ΚΠολΔ': [
        { name: 'Κατάθεση ανακοπής', days: -15, type: 'mandatory' },
        { name: 'Επίδοση ανακοπής', days: -8, type: 'mandatory' }
      ],
      'αγωγή': [
        { name: 'Κατάθεση προτάσεων', days: -20, type: 'mandatory' },
        { name: 'Προσθήκη-Αντίκρουση', days: 5, type: 'optional', after: 'court' }
      ],
      'έφεση': [
        { name: 'Κατάθεση έφεσης', days: -30, type: 'mandatory', from: 'decision' },
        { name: 'Λόγοι έφεσης', days: -30, type: 'mandatory' }
      ]
    };
    
    const deadlines = legalDeadlines[caseType] || [];
    
    for (const deadline of deadlines) {
      const date = this.calculateDeadlineDate(courtDate, deadline);
      suggestions.push({
        name: deadline.name,
        date: date,
        type: deadline.type,
        legalBasis: this.getLegalBasis(caseType, deadline.name),
        priority: deadline.type === 'mandatory' ? 'high' : 'medium',
        reminder: this.suggestReminderSchedule(date, deadline.type)
      });
    }
    
    // AI-enhanced suggestions
    const aiSuggestions = await this.getAISuggestions(caseType, documentType);
    suggestions.push(...aiSuggestions);
    
    return suggestions.sort((a, b) => a.date - b.date);
  }

  calculateDeadlineDate(baseDate, deadline) {
    const date = new Date(baseDate);
    
    if (deadline.after === 'court') {
      date.setDate(date.getDate() + deadline.days);
    } else {
      date.setDate(date.getDate() + deadline.days);
    }
    
    // Skip weekends and holidays
    while (this.isHoliday(date) || date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() + 1);
    }
    
    return date;
  }

  // Natural Language Search
  async semanticSearch(query, userId) {
    try {
      // Create embedding for query
      const queryEmbedding = await this.createEmbedding(query);
      
      // Search across all collections
      const results = await Promise.all([
        this.searchClients(queryEmbedding, userId),
        this.searchCourts(queryEmbedding, userId),
        this.searchDocuments(queryEmbedding, userId),
        this.searchCommunications(queryEmbedding, userId)
      ]);
      
      // Combine and rank results
      const combined = results.flat().sort((a, b) => b.score - a.score);
      
      // Use GPT to understand intent
      const intent = await this.understandIntent(query);
      
      // Filter based on intent
      const filtered = this.filterByIntent(combined, intent);
      
      return {
        results: filtered.slice(0, 20),
        intent: intent,
        suggestions: await this.getSuggestions(query, filtered)
      };
    } catch (error) {
      console.error('Semantic search error:', error);
      throw error;
    }
  }

  async createEmbedding(text) {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    });
    
    return response.data[0].embedding;
  }

  // Legal Research Assistant
  async researchAssistant(topic, context) {
    const prompt = `
    Ως νομικός σύμβουλος εξειδικευμένος στο ελληνικό δίκαιο, παρέχετε:
    
    Θέμα: ${topic}
    Πλαίσιο: ${context}
    
    1. Σχετική νομοθεσία και άρθρα
    2. Πρόσφατη νομολογία
    3. Νομική ανάλυση
    4. Πρακτικές συμβουλές
    5. Πιθανά ζητήματα και κίνδυνοι
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3 // Lower temperature for more focused legal advice
    });

    return this.formatLegalResearch(response.choices[0].message.content);
  }

  // Smart Email Drafting
  async draftEmail(context, recipient, purpose) {
    const templates = await CommunicationTemplate.find({
      user: context.userId,
      category: purpose
    });

    let draft;
    
    if (templates.length > 0) {
      // Use existing template as base
      draft = templates[0].render(context);
    } else {
      // Generate with AI
      const prompt = `
      Συντάξτε επαγγελματικό email στα ελληνικά:
      
      Παραλήπτης: ${recipient.type} (${recipient.name})
      Σκοπός: ${purpose}
      Πλαίσιο: ${JSON.stringify(context)}
      
      Το email πρέπει να είναι:
      - Επαγγελματικό και ευγενικό
      - Σαφές και περιεκτικό
      - Νομικά ακριβές
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }]
      });

      draft = this.parseEmailDraft(response.choices[0].message.content);
    }
    
    // Enhance with legal disclaimers if needed
    if (purpose === 'legal_advice') {
      draft.body += '\n\n' + this.getLegalDisclaimer();
    }
    
    return draft;
  }

  // Voice Transcription Service
  async transcribeAudio(audioPath, language = 'el') {
    try {
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: 'whisper-1',
        language: language,
        response_format: 'verbose_json'
      });

      // Extract legal terms and create summary
      const analysis = await this.analyzeLegalConversation(transcription.text);
      
      return {
        text: transcription.text,
        duration: transcription.duration,
        segments: transcription.segments,
        legalTerms: analysis.terms,
        summary: analysis.summary,
        actionItems: analysis.actionItems,
        deadlines: analysis.deadlines
      };
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  // Client Risk Assessment
  async assessClientRisk(clientData, financialData) {
    const factors = {
      paymentHistory: this.analyzePaymentHistory(financialData),
      caseComplexity: this.assessCaseComplexity(clientData.cases),
      communicationFrequency: this.analyzeCommunication(clientData.communications),
      documentCompliance: this.assessDocumentCompliance(clientData.documents),
      disputeHistory: this.analyzeDisputes(clientData.disputes)
    };

    const riskScore = this.calculateRiskScore(factors);
    
    const aiAssessment = await this.getAIRiskAssessment(clientData, factors);
    
    return {
      score: riskScore,
      level: this.getRiskLevel(riskScore),
      factors: factors,
      recommendations: aiAssessment.recommendations,
      creditLimit: aiAssessment.creditLimit,
      paymentTerms: aiAssessment.paymentTerms,
      monitoringLevel: aiAssessment.monitoringLevel
    };
  }

  // Smart Billing Optimization
  async optimizeBilling(timeEntries, clientData, marketRates) {
    const analysis = {
      totalHours: timeEntries.reduce((sum, entry) => sum + entry.hours, 0),
      averageRate: this.calculateAverageRate(timeEntries),
      efficiency: await this.analyzeEfficiency(timeEntries),
      profitability: await this.analyzeProfitability(timeEntries, clientData)
    };

    const optimization = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'user',
        content: `
        Αναλύστε και βελτιστοποιήστε την τιμολόγηση:
        
        Δεδομένα: ${JSON.stringify(analysis)}
        Τιμές αγοράς: ${JSON.stringify(marketRates)}
        
        Προτείνετε:
        1. Βέλτιστη τιμολόγηση
        2. Εναλλακτικές μεθόδους χρέωσης
        3. Τρόπους αύξησης κερδοφορίας
        4. Benchmarking με την αγορά
        `
      }]
    });

    return this.parseBillingOptimization(optimization.choices[0].message.content);
  }

  // Conflict Detection
  async detectConflicts(newClientData, existingClients) {
    const conflicts = [];
    
    // Check for direct conflicts
    for (const client of existingClients) {
      // Name similarity
      const nameSimilarity = this.calculateSimilarity(
        newClientData.name,
        client.name
      );
      
      if (nameSimilarity > 0.8) {
        conflicts.push({
          type: 'name',
          severity: 'high',
          client: client,
          similarity: nameSimilarity
        });
      }
      
      // Check opposing parties
      if (client.cases) {
        for (const case_ of client.cases) {
          if (case_.opponent === newClientData.name) {
            conflicts.push({
              type: 'opponent',
              severity: 'critical',
              client: client,
              case: case_
            });
          }
        }
      }
    }
    
    // AI-enhanced conflict check
    const aiConflicts = await this.checkAIConflicts(newClientData, existingClients);
    conflicts.push(...aiConflicts);
    
    return {
      hasConflicts: conflicts.length > 0,
      conflicts: conflicts,
      recommendation: this.getConflictRecommendation(conflicts)
    };
  }

  // Utility Methods
  extractKeywords(tokens, limit = 10) {
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(tokens);
    
    const keywords = [];
    tfidf.listTerms(0).forEach((item, index) => {
      if (index < limit) {
        keywords.push({
          term: item.term,
          score: item.tfidf
        });
      }
    });
    
    return keywords;
  }

  async generateSummary(text, maxLength = 200) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'user',
        content: `Συνοψίστε το ακόλουθο νομικό κείμενο σε ${maxLength} χαρακτήρες: ${text.substring(0, 3000)}`
      }]
    });
    
    return response.choices[0].message.content;
  }

  calculateSimilarity(str1, str2) {
    const distance = natural.JaroWinklerDistance(str1, str2);
    return distance;
  }

  isHoliday(date) {
    // Greek public holidays
    const holidays = [
      '01-01', // New Year
      '06-01', // Epiphany
      '25-03', // Independence Day
      '01-05', // Labour Day
      '15-08', // Assumption
      '28-10', // Ohi Day
      '25-12', // Christmas
      '26-12'  // Boxing Day
    ];
    
    const monthDay = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    return holidays.includes(monthDay);
  }

  // Model Management
  async loadModels() {
    try {
      // Load pre-trained TensorFlow models if available
      const modelPath = path.join(__dirname, '../models');
      
      if (fs.existsSync(path.join(modelPath, 'document-classifier'))) {
        this.documentClassifier = await tf.loadLayersModel(
          `file://${modelPath}/document-classifier/model.json`
        );
      }
      
      if (fs.existsSync(path.join(modelPath, 'outcome-predictor'))) {
        this.outcomePredictor = await tf.loadLayersModel(
          `file://${modelPath}/outcome-predictor/model.json`
        );
      }
    } catch (error) {
      console.log('No pre-trained models found, using API-based predictions');
    }
  }

  async trainModels(trainingData) {
    // Implementation for model training
    // This would be called periodically with historical data
    console.log('Model training not yet implemented');
  }
}

// Export singleton instance
const aiService = new AIService();
module.exports = aiService;