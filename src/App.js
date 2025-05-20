import React, { useState } from 'react';
import axios from 'axios';
import {
  Container, Form, Button, Spinner, Card, Row, Col, Alert, InputGroup
} from 'react-bootstrap';
import './App.css'; // 👈 Make sure this is created with the styles below

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs.toString().padStart(2, '0')}:${mins
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function extractVideoId(url) {
  const match = url.match(/(?:youtube\.com.*v=|youtu\.be\/)([^&]+)/);
  return match ? match[1] : null;
}

function App() {
  const [url, setUrl] = useState('');
  const [subtitles, setSubtitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/generate-subtitles', { url });
      setSubtitles(res.data);
    } catch (err) {
      setError('Something went wrong. Please check the URL or try again.');
      setSubtitles([]);
    } finally {
      setLoading(false);
    }
  };

  const videoId = extractVideoId(url);

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
        <div className="video-wrapper my-4">
          <iframe
            width="100%"
            height="400"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      )}

      <Row className="mt-4">
        {subtitles.map((item, index) => (
          <Col md={6} key={index} className="mb-3">
            <Card className="subtitle-card">
              <Card.Body>
                <Card.Title className="text-info">
                  ⏱ {formatTime(item.start)} → {formatTime(item.end)}
                </Card.Title>
                <Card.Text><b>Original:</b> {item.original}</Card.Text>
                <Card.Text><b>Translated:</b> {item.translated}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default App;
