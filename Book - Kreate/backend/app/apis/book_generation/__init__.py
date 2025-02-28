from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import google.generativeai as genai
import databutton as db
import json
from typing import List, Optional, Dict, Any

router = APIRouter()

# Configure the Gemini API with the key from secrets
gemini_api_key = db.secrets.get("GEMINI_API_KEY")
if not gemini_api_key:
    raise RuntimeError("GEMINI_API_KEY not found in secrets")

genai.configure(api_key=gemini_api_key)

# Define the request model
class GenerateBookPlanRequest(BaseModel):
    title: str = Field(..., description="Title of the book")
    type: str = Field(..., description="Type of book (Fiction, Non-Fiction, Children's Book, Poetry)")
    category: str = Field(..., description="Category of the book")
    chapterCount: int = Field(..., description="Number of chapters in the book")
    authorName: str = Field(..., description="Name of the author")
    acknowledgements: Optional[str] = Field(None, description="Optional acknowledgements")

# Define the chapter model
class ChapterPlan(BaseModel):
    id: str
    title: str
    summary: str
    order: int
    
# Define the book plan model
class BookPlan(BaseModel):
    coverDescription: str
    bookDescription: str
    chapters: List[ChapterPlan]
    endPageContent: str

# Define the generate chapter request model
class GenerateChapterRequest(BaseModel):
    title: str = Field(..., description="Title of the book")
    chapterTitle: str = Field(..., description="Title of the chapter")
    chapterSummary: str = Field(..., description="Summary of the chapter")
    chapterIndex: int = Field(..., description="Index of the chapter in the book")
    totalChapters: int = Field(..., description="Total number of chapters in the book")
    bookType: str = Field(..., description="Type of the book")
    bookCategory: str = Field(..., description="Category of the book")
    authorName: str = Field(..., description="Name of the author")
    previousChapterSummaries: Optional[Dict[str, str]] = Field(None, description="Summaries of previous chapters")

# Define the generate chapter response model
class GenerateChapterResponse(BaseModel):
    content: str
    wordCount: int

# Define the generate cover image request model
class GenerateCoverImageRequest(BaseModel):
    title: str = Field(..., description="Title of the book")
    coverDescription: str = Field(..., description="Description for the cover image")
    bookType: str = Field(..., description="Type of the book")
    bookCategory: str = Field(..., description="Category of the book")

# Define the generate cover image response model
class GenerateCoverImageResponse(BaseModel):
    imageUrl: str

@router.post("/generate-book-plan")
async def generate_book_plan(request: GenerateBookPlanRequest) -> BookPlan:
    try:
        # Create a prompt for the Gemini model
        prompt = f"""
        You are an expert book planner. Create a detailed plan for a {request.type} book titled "{request.title}" in the {request.category} category.
        
        The book should have {request.chapterCount} chapters.
        
        Please structure your response as a valid JSON object with the following format:
        {{"coverDescription": "A detailed description for the cover image, specifying visual elements, style, and mood based on the book's theme and genre",
        "bookDescription": "A compelling 2-3 paragraph description of the book that would appear on the back cover",
        "chapters": [{{"id": "chapter-1", "title": "Chapter Title", "summary": "A detailed 1-2 paragraph summary of the chapter content", "order": 1}}, ...],
        "endPageContent": "Content for the end page, including author bio and concluding thoughts"}}
        
        Additional information:
        Author Name: {request.authorName}
        {f'Acknowledgements: {request.acknowledgements}' if request.acknowledgements else ''}
        
        Make sure chapter titles are creative and appropriate for the {request.type} genre and {request.category} category.
        Ensure the summaries provide enough detail to guide content generation while maintaining consistency across chapters.
        The cover description should suggest visual elements that would work well for the book's genre and theme.
        
        IMPORTANT: Respond ONLY with the JSON object, no other text.
        """
        
        # Generate content using Gemini
        model = genai.GenerativeModel('gemini-1.5-pro')
        response = model.generate_content(prompt)
        
        # Extract the JSON response
        response_text = response.text
        
        # Clean up the response to ensure it's valid JSON
        # Sometimes the model includes markdown code blocks or extra text
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
            
        # Parse the JSON response
        try:
            plan_data = json.loads(response_text)
        except json.JSONDecodeError as json_err:
            # If parsing fails, try to extract just the JSON part
            import re
            json_pattern = r'\{[^\{\}]*((\{[^\{\}]*\})[^\{\}]*)*\}'
            matches = re.findall(json_pattern, response_text)
            if matches and len(matches) > 0:
                try:
                    plan_data = json.loads(matches[0][0])
                except json.JSONDecodeError as nested_err:
                    raise HTTPException(status_code=500, detail="Failed to parse AI response into valid JSON format") from nested_err
            else:
                raise HTTPException(status_code=500, detail="Failed to parse AI response into valid JSON format") from json_err
        
        # Validate the required fields are in the response
        required_fields = ["coverDescription", "bookDescription", "chapters", "endPageContent"]
        for field in required_fields:
            if field not in plan_data:
                raise HTTPException(status_code=500, detail=f"AI response missing required field: {field}")
        
        # Ensure we have the right number of chapters
        if len(plan_data["chapters"]) != request.chapterCount:
            # If not, we'll adjust by either truncating or adding placeholder chapters
            if len(plan_data["chapters"]) > request.chapterCount:
                plan_data["chapters"] = plan_data["chapters"][:request.chapterCount]
            else:
                # Add placeholder chapters to reach the requested count
                for i in range(len(plan_data["chapters"]), request.chapterCount):
                    order = i + 1
                    plan_data["chapters"].append({
                        "id": f"chapter-{order}",
                        "title": f"Chapter {order}",
                        "summary": f"Additional chapter content for Chapter {order}.",
                        "order": order
                    })
        
        # Return the book plan
        return BookPlan(
            coverDescription=plan_data["coverDescription"],
            bookDescription=plan_data["bookDescription"],
            chapters=[ChapterPlan(
                id=chapter.get("id", f"chapter-{idx+1}"),
                title=chapter["title"],
                summary=chapter["summary"],
                order=chapter.get("order", idx+1)
            ) for idx, chapter in enumerate(plan_data["chapters"])],
            endPageContent=plan_data["endPageContent"]
        )
        
    except Exception as e:
        print(f"Error generating book plan: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate book plan: {str(e)}") from e

@router.post("/generate-chapter")
async def generate_chapter(request: GenerateChapterRequest) -> GenerateChapterResponse:
    try:
        # Create a prompt for the Gemini model to generate a chapter
        prompt = f"""
        You are an expert book author writing a {request.bookType} book titled "{request.title}" in the {request.bookCategory} category.
        
        Your task is to write chapter {request.chapterIndex} out of {request.totalChapters}, titled "{request.chapterTitle}".
        
        Here's the summary that you should follow for this chapter:
        {request.chapterSummary}
        
        {"Previous chapters include: " + ', '.join([f'Chapter {idx}: {summary}' for idx, summary in request.previousChapterSummaries.items()]) if request.previousChapterSummaries else ""}
        
        Write a compelling, engaging, and high-quality chapter that is appropriate for the {request.bookType} genre and {request.bookCategory} category. 
        The content should be detailed, creative, and well-structured with proper paragraphs.
        
        For fiction, include dialogue, description, and character development.
        For non-fiction, include clear explanations, examples, and evidence.
        For children's books, use simple language, vivid descriptions, and moral lessons.
        For poetry, focus on rhythm, imagery, and emotional resonance.
        
        IMPORTANT: Respond ONLY with the chapter content, no other text.
        """
        
        # Generate content using Gemini
        model = genai.GenerativeModel('gemini-1.5-pro')
        response = model.generate_content(prompt)
        
        # Calculate word count
        content = response.text
        word_count = len(content.split())
        
        return GenerateChapterResponse(
            content=content,
            wordCount=word_count
        )
        
    except Exception as e:
        print(f"Error generating chapter content: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate chapter content: {str(e)}") from e
