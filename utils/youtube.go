package utils

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strconv"
	"strings"
)

// ExtractVideoID extracts the YouTube video ID from a URL
func ExtractVideoID(url string) (string, error) {
	patterns := []string{
		`(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})`,
		`youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})`,
	}

	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindStringSubmatch(url)
		if len(matches) > 1 {
			return matches[1], nil
		}
	}

	return "", fmt.Errorf("URL YouTube invalide")
}

// VideoInfo contains information about a YouTube video
type VideoInfo struct {
	Title        string
	ThumbnailURL string
	ViewCount    int64
}

// GetVideoInfo fetches video information from YouTube
// This function uses oEmbed API for title and thumbnail, and scrapes the page for view count
func GetVideoInfo(videoID string) (*VideoInfo, error) {
	oembedURL := fmt.Sprintf("https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=%s&format=json", videoID)

	resp, err := http.Get(oembedURL)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération des informations: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("erreur HTTP: %d", resp.StatusCode)
	}

	var oembedData struct {
		Title        string `json:"title"`
		ThumbnailURL string `json:"thumbnail_url"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&oembedData); err != nil {
		return nil, fmt.Errorf("erreur lors du décodage JSON: %v", err)
	}

	// Get view count by scraping the page
	viewCount, err := getViewCount(videoID)
	if err != nil {
		// If we can't get view count, set it to 0 (non-critical)
		viewCount = 0
	}

	return &VideoInfo{
		Title:        oembedData.Title,
		ThumbnailURL: oembedData.ThumbnailURL,
		ViewCount:    viewCount,
	}, nil
}

// getViewCount scrapes the view count from YouTube page
func getViewCount(videoID string) (int64, error) {
	url := fmt.Sprintf("https://www.youtube.com/watch?v=%s", videoID)

	client := &http.Client{}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return 0, err
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")

	resp, err := client.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("erreur HTTP: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, err
	}

	bodyStr := string(body)

	// Try to find view count in ytInitialData (most reliable)
	// Look for "viewCount" in the JSON data embedded in the page
	viewCountPatterns := []string{
		`"viewCount":\s*"(\d+)"`,
		`"viewCount":\s*(\d+)`,
		`"simpleText":"([\d\s,]+)\s*vues"`,
		`"viewCountText":\s*\{[^}]*"simpleText":"([\d\s,]+)\s*vues"`,
		`"runs":\s*\[[^\]]*"text":"([\d\s,]+)\s*vues"`,
	}

	for _, pattern := range viewCountPatterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindAllStringSubmatch(bodyStr, -1)
		for _, match := range matches {
			if len(match) > 1 {
				// Remove spaces, commas, and quotes from the number
				countStr := strings.ReplaceAll(strings.ReplaceAll(strings.ReplaceAll(match[1], " ", ""), ",", ""), "\"", "")
				count, err := strconv.ParseInt(countStr, 10, 64)
				if err == nil && count > 0 {
					return count, nil
				}
			}
		}
	}

	// Try to find in JSON-LD structured data
	jsonLDPattern := regexp.MustCompile(`<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>`)
	jsonLDMatches := jsonLDPattern.FindAllStringSubmatch(bodyStr, -1)
	for _, match := range jsonLDMatches {
		if len(match) > 1 {
			var jsonData map[string]interface{}
			if err := json.Unmarshal([]byte(match[1]), &jsonData); err == nil {
				if interactionStat, ok := jsonData["interactionStatistic"].([]interface{}); ok {
					for _, stat := range interactionStat {
						if statMap, ok := stat.(map[string]interface{}); ok {
							if statMap["@type"] == "WatchAction" {
								if countStr, ok := statMap["userInteractionCount"].(string); ok {
									count, err := strconv.ParseInt(countStr, 10, 64)
									if err == nil {
										return count, nil
									}
								}
							}
						}
					}
				}
			}
		}
	}

	return 0, fmt.Errorf("impossible de trouver le nombre de vues")
}

// GetVideoInfoFromURL extracts video ID and fetches all video information
func GetVideoInfoFromURL(url string) (*VideoInfo, error) {
	videoID, err := ExtractVideoID(url)
	if err != nil {
		return nil, err
	}

	return GetVideoInfo(videoID)
}
