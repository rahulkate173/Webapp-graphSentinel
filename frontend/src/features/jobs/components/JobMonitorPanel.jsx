import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Activity, CheckCircle2, XCircle, Loader2, UploadCloud } from 'lucide-react';
import { clearJobs } from '../jobs.slice.js';
import { setFraudDataFromUpload } from '../../fraud/fraud.slice';
import { useNavigate } from 'react-router-dom';
import '../styles/JobMonitor.css';

/* ── Status metadata ─────────────────────────────────────────────────────── */
const STATUS_META = {
  UPLOADING_FILES: {
    label:     'Uploading files…',
    badgeCls:  'job-badge--uploading',
    fillCls:   'job-card__progress-fill--uploading',
    Icon:      UploadCloud,
    animated:  true,
  },
  RUNNING_ML_MODEL: {
    label:     'Running ML model…',
    badgeCls:  'job-badge--running',
    fillCls:   'job-card__progress-fill--running',
    Icon:      Loader2,
    animated:  true,
  },
  COMPLETED: {
    label:     'Completed',
    badgeCls:  'job-badge--completed',
    fillCls:   'job-card__progress-fill--completed',
    Icon:      CheckCircle2,
    animated:  false,
  },
  FAILED: {
    label:     'Failed',
    badgeCls:  'job-badge--failed',
    fillCls:   'job-card__progress-fill--failed',
    Icon:      XCircle,
    animated:  false,
  },
};

const DEFAULT_META = {
  label:    'Pending…',
  badgeCls: 'job-badge--uploading',
  fillCls:  'job-card__progress-fill--uploading',
  Icon:     Loader2,
  animated: true,
};

/* ── Single job card ───────────────────────────────────────────────────────── */
function JobCard({ job }) {
  const [showResult, setShowResult] = useState(false);
  const meta = STATUS_META[job.status] ?? DEFAULT_META;
  const { Icon } = meta;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleViewResult = () => {
    if (job.data && job.data.ml_response) {
      dispatch(setFraudDataFromUpload(job.data.ml_response));
      navigate('/fraud-rings');
    }
  };

  return (
    <div className="job-card" role="listitem">
      {/* Top row: job ID + badge */}
      <div className="job-card__top">
        <span className="job-card__id" title={job.jobId}>
          {job.jobId}
        </span>

        <span className={`job-badge ${meta.badgeCls}`}>
          {meta.animated ? (
            <span className="job-badge__dot" aria-hidden="true" />
          ) : (
            <Icon size={10} />
          )}
          {meta.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="job-card__progress" aria-hidden="true">
        <div className={`job-card__progress-fill ${meta.fillCls}`} />
      </div>

      {/* COMPLETED — show View Result button */}
      {job.status === 'COMPLETED' && job.data && (
        <button
          id={`view-result-${job.jobId}`}
          className="job-card__view-btn"
          onClick={handleViewResult}
        >
          View Result in Dashboard
        </button>
      )}

      {/* FAILED — show error */}
      {job.status === 'FAILED' && job.error && (
        <p className="job-card__error" role="alert">
          ⚠ {job.error}
        </p>
      )}
    </div>
  );
}

/* ── Panel ────────────────────────────────────────────────────────────────── */
const JobMonitorPanel = () => {
  const dispatch = useDispatch();
  const jobs     = useSelector((state) => state.jobs.jobs);
  const jobList  = Object.values(jobs).sort(
    (a, b) => (b.jobId ?? '').localeCompare(a.jobId ?? '')
  );

  return (
    <section className="job-monitor" aria-labelledby="job-monitor-title">
      {/* Header */}
      <div className="job-monitor__header">
        <div className="job-monitor__icon-box" aria-hidden="true">
          <Activity size={17} color="#fff" strokeWidth={2.2} />
        </div>
        <div>
          <h3 className="job-monitor__title" id="job-monitor-title">
            Real-Time Job Monitor
          </h3>
          <p className="job-monitor__subtitle">
            Live updates from external API submissions
          </p>
        </div>
      </div>

      {/* Job list or empty state */}
      {jobList.length === 0 ? (
        <p className="job-monitor__empty">
          No jobs yet — trigger a POST to <code>/api/files/external-upload-csv</code>
        </p>
      ) : (
        <>
          <div className="job-monitor__list" role="list">
            {jobList.map((job) => (
              <JobCard key={job.jobId} job={job} />
            ))}
          </div>
          <button
            className="job-monitor__clear"
            onClick={() => dispatch(clearJobs())}
            aria-label="Clear all jobs"
          >
            Clear all
          </button>
        </>
      )}
    </section>
  );
};

export default JobMonitorPanel;
