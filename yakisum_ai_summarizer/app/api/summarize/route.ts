import { NextRequest, NextResponse } from "next/server";
import { getSubData } from "@/lib/helpers";
import natural from "natural";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL;



async function geminiSummarize(text: string): Promise<string> {
  if (!GEMINI_API_KEY || !GEMINI_API_URL) {
    console.error("Missing environment variables:", { 
      GEMINI_API_KEY: !!GEMINI_API_KEY, 
      GEMINI_API_URL: !!GEMINI_API_URL 
    });
    return "Error: Missing API configuration. Please check your environment variables.";
  }
  
  const prompt = `Summarize the following content in 3-5 sentences.\n\n${text}`;
  console.log("Making request to Gemini:", { url: GEMINI_API_URL, hasKey: !!GEMINI_API_KEY });
  const res = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  // console log; res
  console.log("Gemini response status:", res.status, res.statusText);
  console.log("Gemini response headers:", Object.fromEntries(res.headers.entries()));
  
  if (res.ok) {
    const data = await res.json();
    console.log("Gemini response data:", data);
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } else {
    const errorText = await res.text();
    console.log("Gemini error response:", errorText);
    return "Could not generate summary.";
  }
}

function extractArticleInfo(event: any) {
  // Debug: log the event structure to understand what we're working with
  console.log("Processing event:", {
    id: event.id,
    kind: event.kind,
    hasContent: !!event.content,
    contentLength: event.content?.length || 0,
    tags: event.tags?.length || 0,
    pubkey: event.pubkey?.substring(0, 16) + "..."
  });

  // NIP-23: extract from tags
  const title = event.tags?.find((tag: any) => tag[0] === 'title')?.[1] || 
                event.tags?.find((tag: any) => tag[0] === 'd')?.[1] || 
                "Untitled";
  
  const summary = event.tags?.find((tag: any) => tag[0] === 'summary')?.[1] || "";
  const image = event.tags?.find((tag: any) => tag[0] === 'image')?.[1] || 
                event.tags?.find((tag: any) => tag[0] === 'thumbnail')?.[1] || 
                "/placeholder.svg";
  
  const author = event.pubkey;
  const createdDate = new Date((event.created_at || 0) * 1000);
  const now = new Date();
  const timeDiff = now.getTime() - createdDate.getTime();
  
  // Calculate relative time
  let timeAgo = "recently";
  if (timeDiff < 60000) { // less than 1 minute
    timeAgo = "just now";
  } else if (timeDiff < 3600000) { // less than 1 hour
    const minutes = Math.floor(timeDiff / 60000);
    timeAgo = `${minutes}m ago`;
  } else if (timeDiff < 86400000) { // less than 1 day
    const hours = Math.floor(timeDiff / 3600000);
    timeAgo = `${hours}h ago`;
  } else if (timeDiff < 2592000000) { // less than 30 days
    const days = Math.floor(timeDiff / 86400000);
    timeAgo = `${days}d ago`;
  } else {
    timeAgo = createdDate.toLocaleDateString();
  }
  
  const url = `https://yakihonne.com/a/${event.id}`;
  
  // Popularity metrics
  const likes = parseInt(event.tags?.find((tag: any) => tag[0] === 'likes')?.[1] || '0', 10);
  const reposts = parseInt(event.tags?.find((tag: any) => tag[0] === 'reposts')?.[1] || '0', 10);
  const zaps = parseInt(event.tags?.find((tag: any) => tag[0] === 'zaps')?.[1] || '0', 10);
  const replies = parseInt(event.tags?.find((tag: any) => tag[0] === 'replies')?.[1] || '0', 10);
  const popularity = likes + reposts + zaps + replies;
  
  // Calculate read time based on content length
  const contentLength = event.content?.length || 0;
  const wordsPerMinute = 200; // Average reading speed
  const wordCount = contentLength / 5; // Rough estimate: 5 characters per word
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  const readTime = `${readTimeMinutes} min read`;
  
  // Better excerpt handling
  let excerpt = summary;
  if (!excerpt && event.content) {
    // Try to extract a clean excerpt from content
    const cleanContent = event.content.replace(/^#\s*.*$/gm, '').trim(); // Remove markdown headers
    excerpt = cleanContent.slice(0, 200);
    if (excerpt.length === 200) {
      excerpt += "...";
    }
  }
  
  // Debug: log what we extracted
  console.log("Extracted article info:", {
    title,
    excerptLength: excerpt?.length || 0,
    hasImage: !!image,
    popularity,
    readTime,
    timeAgo
  });
  
  return {
    id: event.id,
    title,
    author,
    authorName: author?.substring?.(0, 8) || "Unknown",
    timeAgo,
    readTime,
    excerpt: excerpt || "No preview available",
    thumbnail: image,
    url,
    content: event.content,
    stats: { likes, reposts, zaps, replies, popularity },
  };
}

// Helper: Use Gemini to extract keywords from a query
async function geminiExtractKeywords(query: string): Promise<string[]> {
  if (!GEMINI_API_KEY || !GEMINI_API_URL) {
    return [];
  }
  const prompt = `Extract the main topics or keywords from this query for searching articles. Return a comma-separated list of keywords.\n\nQuery: ${query}`;
  const res = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  if (res.ok) {
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // Split by comma, trim, filter empty
    return text.split(/,|\n/).map((k: string) => k.trim()).filter(Boolean);
  }
  return [];
}

// Helper: Classify user intent
async function classifyUserIntent(query: string): Promise<{
  intent: 'greeting' | 'question' | 'search' | 'help' | 'unknown';
  response?: string;
  shouldSearch?: boolean;
}> {
  console.log("Classifying intent for query:", query);
  
  if (!GEMINI_API_KEY || !GEMINI_API_URL) {
    // Fallback classification without Gemini
    const lowerQuery = query.toLowerCase().trim();
    console.log("Using fallback classification, lowerQuery:", lowerQuery);
    
    // Greetings
    if (['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'].some(greeting => 
      lowerQuery.includes(greeting))) {
      console.log("Classified as greeting");
      return {
        intent: 'greeting',
        response: "Hello! I'm Yakisum, your AI assistant for discovering and summarizing articles from Yakihonne. How can I help you today?",
        shouldSearch: false
      };
    }
    
    // Help requests
    if (['help', 'what can you do', 'how does this work', 'instructions', 'guide'].some(help => 
      lowerQuery.includes(help))) {
      return {
        intent: 'help',
        response: "I can help you find and summarize articles from Yakihonne! Here's what I can do:\n\n• Search for articles by topic, keywords, or questions\n• Summarize specific articles you're interested in\n• Show trending and popular content\n• Answer questions about articles\n\nJust ask me anything like 'Find articles about blockchain' or 'Summarize this article'!",
        shouldSearch: false
      };
    }
    
    // Questions (not search queries)
    if (['what is', 'how does', 'can you explain', 'tell me about', 'who is'].some(q => 
      lowerQuery.includes(q)) && !lowerQuery.includes('article') && !lowerQuery.includes('find')) {
      return {
        intent: 'question',
        response: "I'd be happy to help answer your question! However, I'm specifically designed to help you discover and summarize articles from Yakihonne. Could you try asking me to find articles about your topic instead? For example: 'Find articles about [your topic]' or 'Search for [your topic]'",
        shouldSearch: false
      };
    }
    
    // Default to search
    return {
      intent: 'search',
      shouldSearch: true
    };
  }

  // Use Gemini for more sophisticated intent classification
  const prompt = `Classify the user's intent and provide an appropriate response. The user is interacting with Yakisum, an AI assistant for discovering and summarizing articles from the Nostr network.

User query: "${query}"

Classify the intent as one of:
- "greeting" - if it's a hello, hi, hey, or general greeting
- "help" - if asking for help, instructions, or what the assistant can do
- "question" - if asking a general question that's not about finding articles
- "search" - if looking for articles, content, or information to search for

Return as JSON:
{
  "intent": "greeting|help|question|search",
  "response": "appropriate response message if intent is greeting, help, or question",
  "shouldSearch": true/false
}

For greetings, be friendly and explain what Yakisum can do.
For help requests, explain the capabilities clearly.
For questions, politely redirect to article search.
For search, don't include a response.`;

  const res = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  
  if (res.ok) {
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    try {
      const parsed = JSON.parse(text);
      return {
        intent: parsed.intent || 'search',
        response: parsed.response,
        shouldSearch: parsed.shouldSearch !== false
      };
    } catch {
      // Fallback to simple classification
      return {
        intent: 'search',
        shouldSearch: true
      };
    }
  }
  
  return {
    intent: 'search',
    shouldSearch: true
  };
}

// Helper: Use Gemini to extract search intent (keywords, category, recency)
async function geminiExtractSearchIntent(query: string): Promise<{ keywords: string[]; category?: string; recency?: string }> {
  if (!GEMINI_API_KEY || !GEMINI_API_URL) {
    return { keywords: [] };
  }
  const prompt = `Extract the main topics, category, and any time filters (like 'recent', 'last week', etc.) from this query for searching articles. Return as JSON:
{
  "keywords": [...],
  "category": "...",
  "recency": "..."
}
Query: ${query}`;
  const res = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  if (res.ok) {
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    try {
      const parsed = JSON.parse(text);
      return {
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map((k: string) => k.trim()).filter(Boolean) : [],
        category: parsed.category || undefined,
        recency: parsed.recency || undefined,
      };
    } catch {
      // fallback: try to extract keywords as before
      return { keywords: text.split(/,|\n/).map((k: string) => k.trim()).filter(Boolean) };
    }
  }
  return { keywords: [] };
}

export async function POST(req: NextRequest) {
  // Debug environment variables for Vercel
  console.log("Vercel Environment Check:", {
    GEMINI_API_KEY: GEMINI_API_KEY ? "SET" : "NOT SET",
    GEMINI_API_URL: GEMINI_API_URL ? "SET" : "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV
  });
  
  const body = await req.json();
  const { query, articleId, url } = body;

  // 1. If summarizing a specific article (by articleId or url)
  if (articleId || url) {
    let content = "";
    let title = "Article";
    // Try to use search results if available in body.articles
    let found = null;
    if (body.articles && Array.isArray(body.articles)) {
      found = body.articles.find((a: any) => a.id === articleId || a.url === url);
      if (found) {
        content = found.content || found.excerpt || found.title || "";
        title = found.title || title;
      }
    }
    // If not found, fetch from Nostr by ID (kind 30023, historical)
    if (!found && articleId) {
      // Fetch all historical articles (no since filter)
      const { data: events } = await getSubData([{ kinds: [30023] }], 5000);
      const event = events.find((e: any) => e.id === articleId);
      if (event) {
        content = event.content;
        title = extractArticleInfo(event).title;
      }
    } else if (!found && url) {
      // For web articles: fetch and extract text (not implemented here)
      content = `Content from ${url}`;
      title = url;
    }
    if (!content) {
      return NextResponse.json({
        type: "widget",
        layout: "summary",
        body: {
          title: "Not found",
          summary: "Could not find the article to summarize.",
          articles: [],
        },
      });
    }
    console.log("Gemini input content:", content);
    const summary = await geminiSummarize(content);
    return NextResponse.json({
      type: "widget",
      layout: "summary",
      body: {
        title: `Summary for ${title}`,
        postId: articleId || url || null, // Add postId for faint display
        summary,
        debugContent: content,
        debugRequest: body,
        articles: [],
      },
    });
  }

  // 2. Handle conversational queries and search
  if (query) {
    // First, classify the user's intent
    const intent = await classifyUserIntent(query);
    
    console.log("Intent classification result:", {
      query,
      intent: intent.intent,
      shouldSearch: intent.shouldSearch,
      response: intent.response
    });
    
    // If it's a greeting, help request, or general question, return conversational response
    if (intent.intent === 'greeting' || intent.intent === 'help' || intent.intent === 'question') {
      console.log("Returning conversational response for:", intent.intent);
      return NextResponse.json({
        type: "widget",
        layout: "summary",
        body: {
          title: "Yakisum Assistant",
          summary: intent.response || "Hello! How can I help you discover articles?",
          articles: [],
        },
      });
    }
    
    // If it's not a search query, return a helpful response
    if (!intent.shouldSearch) {
      console.log("Returning non-search response");
      return NextResponse.json({
        type: "widget",
        layout: "summary",
        body: {
          title: "Yakisum Assistant",
          summary: intent.response || "I'm here to help you find and summarize articles from Yakihonne. Try asking me to search for articles about a specific topic!",
          articles: [],
        },
      });
    }
    
    console.log("Proceeding with article search for query:", query);
    
    // TEMPORARY: For debugging, let's add a simple test
    if (query.toLowerCase().includes('hello') || query.toLowerCase().includes('hi')) {
      console.log("DEBUG: Detected hello/hi, returning greeting response");
      return NextResponse.json({
        type: "widget",
        layout: "summary",
        body: {
          title: "Yakisum Assistant",
          summary: "Hello! I'm Yakisum, your AI assistant for discovering and summarizing articles from Yakihonne. How can I help you today?",
          articles: [],
        },
      });
    }
    
    // Support offset and limit for pagination
    const offset = typeof body.offset === 'number' ? body.offset : 0;
    const limit = typeof body.limit === 'number' ? body.limit : 5;
    
    // Use cache for "Show more" (offset > 0), fresh data for new searches
    const useCache = offset > 0;
    console.log("Using cache:", useCache, "for offset:", offset);
    
    // Fetch all historical articles (no since filter)
    const { data: events } = await getSubData([{ kinds: [30023] }], 5000, useCache);
    
    // Deep debug: Log first 3 raw events
    console.log("Raw events from relay (first 3):", events.slice(0, 3));
    events.slice(0, 3).forEach((event, idx) => {
      console.log(`Event #${idx} tags:`, event.tags);
    });
    
    // Filter out invalid or malformed events
    let validEvents = events.filter((event: any) => {
      // Must be kind 30023
      if (event.kind !== 30023) return false;
      // Must have content
      if (!event.content || event.content.trim().length === 0) return false;
      // Must have an ID
      if (!event.id) return false;
      // Must have a pubkey
      if (!event.pubkey) return false;
      // Content must be at least 50 characters (filter out very short posts)
      if (event.content.trim().length < 50) return false;
      return true;
    });
    
    console.log(`Found ${events.length} total events, ${validEvents.length} valid NIP-23 articles`);
    
    let filtered = validEvents;
    let usedKeywords: string[] = [];
    let usedCategory: string | undefined;
    let usedRecency: string | undefined;
    
    // Only extract search intent if this is actually a search query
    // REPLACE GEMINI: Always use manual keyword extraction
    // Use 'natural' for stopword removal
    const tokenizer = new natural.WordTokenizer();
    usedKeywords = tokenizer.tokenize(query.toLowerCase());
    usedKeywords = usedKeywords.filter((word: string) => word.length > 2 && !natural.stopwords.includes(word));
    console.log("[Natural Stopword Extraction] Query:", query, "=>", usedKeywords);
    
    console.log("Before keyword filtering:", filtered.length, "articles");
    console.log("Query:", query);
    console.log("Used keywords:", usedKeywords);
    
    // Filter by keywords
    if (usedKeywords.length > 0) {
      const qwords = usedKeywords.map((k) => k.toLowerCase());
      console.log("Filtering with keywords:", qwords);
      filtered = filtered.filter((e: any) => {
        const title = e.tags?.find((tag: any) => tag[0] === 'title')?.[1] || "";
        const summary = e.tags?.find((tag: any) => tag[0] === 'summary')?.[1] || "";
        const content = e.content || "";
        const matches = qwords.some((kw) =>
          title.toLowerCase().includes(kw) ||
          summary.toLowerCase().includes(kw) ||
          content.toLowerCase().includes(kw)
        );
        if (matches) {
          console.log("Article matches:", title);
        }
        return matches;
      });
      console.log("After keyword filtering:", filtered.length, "articles");
    } else {
      console.log("No keywords extracted, trying simple keyword extraction");
      // Simple keyword extraction as fallback
      const simpleKeywords = query.toLowerCase()
        .split(/\s+/)
        .filter((word: string) => word.length > 2 && !['the', 'and', 'or', 'for', 'with', 'about', 'find', 'articles', 'show', 'me'].includes(word));
      
      if (simpleKeywords.length > 0) {
        console.log("Using simple keywords:", simpleKeywords);
        filtered = filtered.filter((e: any) => {
          const title = e.tags?.find((tag: any) => tag[0] === 'title')?.[1] || "";
          const summary = e.tags?.find((tag: any) => tag[0] === 'summary')?.[1] || "";
          const content = e.content || "";
          const matches = simpleKeywords.some((kw: string) =>
            title.toLowerCase().includes(kw) ||
            summary.toLowerCase().includes(kw) ||
            content.toLowerCase().includes(kw)
          );
          if (matches) {
            console.log("Article matches (simple):", title);
          }
          return matches;
        });
        console.log("After simple keyword filtering:", filtered.length, "articles");
      } else {
        console.log("No simple keywords found either");
      }
    }
    // Filter by category if present
    if (usedCategory) {
      filtered = filtered.filter((e: any) => {
        const category = e.tags?.find((tag: any) => tag[0] === 'category')?.[1]?.toLowerCase() || "";
        return category.includes(usedCategory.toLowerCase());
      });
    }
    // Filter by recency if present (simple: if 'recent', sort by created_at desc)
    if (usedRecency && /recent|today|week|month|new/i.test(usedRecency)) {
      filtered = filtered.sort((a: any, b: any) => (b.created_at || 0) - (a.created_at || 0));
    }
    // Sort by popularity, fallback to recency
    let articles = filtered
      .map(extractArticleInfo)
      .sort((a, b) => {
        if ((b.stats?.popularity || 0) !== (a.stats?.popularity || 0)) {
          return (b.stats?.popularity || 0) - (a.stats?.popularity || 0);
        }
        // Fallback: recency
        return (b.timeAgo > a.timeAgo ? 1 : -1);
      });
    
    // Additional quality filtering after metadata extraction
    articles = articles.filter(article => {
      // Filter out articles with titles that look like random IDs
      if (/^[a-z0-9]{10,}$/.test(article.title)) return false;
      // Filter out articles with JSON as excerpt/content
      if ((article.excerpt && article.excerpt.trim().startsWith('{') && article.excerpt.trim().endsWith('}')) ||
          (article.content && article.content.trim().startsWith('{') && article.content.trim().endsWith('}'))) return false;
      // Filter out articles with very short or generic titles
      if (!article.title || article.title.length < 5) return false;
      // Filter out articles with excerpts that are too short
      if (!article.excerpt || article.excerpt.length < 20) return false;
      // Filter out articles that look like JSON or malformed content
      if (article.excerpt.includes('"title"') || 
          article.excerpt.includes('"content"') ||
          article.excerpt.includes('"tags"')) {
        return false;
      }
      return true;
    });

    // Improve excerpt extraction: if excerpt is JSON, try to extract a summary or fallback to clean text
    articles = articles.map(article => {
      let excerpt = article.excerpt;
      if (excerpt && excerpt.trim().startsWith('{') && excerpt.trim().endsWith('}')) {
        try {
          const json = JSON.parse(excerpt);
          excerpt = json.summary || json.description || json.content || Object.values(json)[0] || '';
        } catch {
          excerpt = '';
        }
      }
      // Fallback to clean text if still not valid
      if (!excerpt && article.content) {
        const cleanContent = article.content.replace(/^#\s*.*$/gm, '').trim();
        excerpt = cleanContent.slice(0, 200);
        if (excerpt.length === 200) excerpt += '...';
      }
      return { ...article, excerpt };
    });
    
    // Deduplicate by id before slicing for pagination
    const seenIds = new Set();
    articles = articles.filter(article => {
      if (seenIds.has(article.id)) return false;
      seenIds.add(article.id);
      return true;
    });
    const total = articles.length;
    articles = articles.slice(offset, offset + limit);
    console.log("Final articles after filtering and slicing:", articles.length);
    
    if (articles.length === 0) {
      console.log("Fallback triggered. Returning these articles (titles):", validEvents.slice(0, limit).map(e => e.tags?.find((tag: any) => tag[0] === 'title')?.[1] || e.id));
      // If the query includes 'trending', 'popular', or 'discussions', return most popular/recent
      articles = validEvents
        .map(extractArticleInfo)
        .filter(article => {
          // Apply the same quality filters to fallback articles
          if (article.title === "Untitled" || 
              article.title.toLowerCase().includes("untitled") ||
              article.title.length < 3) {
            return false;
          }
          if (!article.excerpt || article.excerpt.length < 20) {
            return false;
          }
          if (article.excerpt.includes('{"title"') || 
              article.excerpt.includes('"content"') ||
              article.excerpt.includes('"tags"')) {
            return false;
          }
          return true;
        })
        .sort((a, b) => {
          if ((b.stats?.popularity || 0) !== (a.stats?.popularity || 0)) {
            return (b.stats?.popularity || 0) - (a.stats?.popularity || 0);
          }
          return (b.timeAgo > a.timeAgo ? 1 : -1);
        })
        .slice(0, limit);
    }
    return NextResponse.json({
      type: "widget",
      layout: "summary",
      body: {
        title: `Found ${total} articles.`,
        summary: articles.length > 0
          ? `Showing ${offset + 1}-${offset + articles.length}. Please select any to summarize.`
          : `No direct matches found. Here are some recent or trending articles you might like:`,
        articles,
        total,
        offset,
        limit,
        debugRequest: { query, usedKeywords, usedCategory, usedRecency },
      },
    });
  }

  // 3. If neither, return error
  return NextResponse.json({
    type: "widget",
    layout: "summary",
    body: {
      title: "Invalid request",
      summary: "Please provide a query or an article to summarize.",
      articles: [],
      debugRequest: body,
      debugEnv: {
        GEMINI_API_KEY: GEMINI_API_KEY ? "SET" : "NOT SET",
        GEMINI_API_URL: GEMINI_API_URL ? "SET" : "NOT SET",
        NODE_ENV: process.env.NODE_ENV
      }
    },
  }, { status: 400 });
} 