import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Container, Form, Button, Spinner, Alert, InputGroup, Row, Col
} from 'react-bootstrap';
import './App.css';

function extractVideoId(url) {
  const match = url.match(/(?:youtube\.com.*v=|youtu\.be\/)([^&]+)/);
  return match ? match[1] : null;
}

function App() {
  const [url, setUrl] = useState('');
  const [subtitles, setSubtitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const subtitleRef = useRef(null);

  const videoId = extractVideoId(url);

  useEffect(() => {
    if (url && !videoId) {
      setError('Invalid YouTube URL format.');
    }
  }, [url]);

  useEffect(() => {
    if (subtitles.length && subtitleRef.current) {
      subtitleRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [subtitles]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSubtitles([]);

    if (!url.trim()) {
      setError('Please enter a valid YouTube URL.');
      setLoading(false);
      return;
    }

    if (!extractVideoId(url)) {
      setError('Invalid YouTube URL format.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/generate-subtitles', { url });
      setSubtitles(res.data);
    } catch (err) {
      setError('Something went wrong. Please check the URL or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4 app-bg text-white">
      <h1 className="mb-5 text-center flashy-title">🎬 YouTube Subtitle Generator</h1>

      <Form className="mb-4">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Paste YouTube URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="url-input"
          />
          <Button onClick={handleSubmit} className="submit-btn">
            {loading ? <Spinner animation="border" size="sm" /> : '🚀 Generate'}
          </Button>
        </InputGroup>
      </Form>

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      {videoId && (
        <Row className="my-4">
          <Col md={6}>
            <div style={{ position: 'sticky', top: '20px' }}>
              <iframe
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          </Col>

          <Col md={6}>
            {!loading && subtitles.length > 0 && (
              <div
                ref={subtitleRef}
                style={{
                  maxHeight: '315px',
                  overflowY: 'auto',
                  backgroundColor: '#0f172a',
                  color: '#f1f5f9',
                  padding: '1rem',
                  borderRadius: '10px',
                  fontFamily: "'Fira Code', monospace",
                  fontSize: '16px',
                  lineHeight: '1.6',
                  boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                }}
              >
                {subtitles.map((item, index) => (
                  <div key={index}>
                    <span style={{ color: '#38bdf8' }}>
                      {item.start ?? '00:00:00'} → {item.end ?? '00:00:00'}
                    </span>:&nbsp;
                    <span>{item.translated || item.original}</span>
                  </div>
                ))}
              </div>
            )}
          </Col>
        </Row>
      )}

      {!loading && subtitles.length === 0 && !error && videoId && (
        <p className="text-warning mt-3">No subtitles found for this video.</p>
      )}
    </Container>
  );
}

export default App;
