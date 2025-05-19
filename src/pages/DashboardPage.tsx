// src/pages/DashboardPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import ImageUploader from '../components/ImageUploader';
import ResultDisplay from '../components/ResultDisplay';
import FirestoreIndexHelper from '../components/FirestoreIndexHelper';
import { FaHistory, FaUpload, FaSpinner, FaExclamationCircle, FaChevronDown } from 'react-icons/fa';
import {
  addScanResult,
  getUserScanResults,
  getUserScanCount,
  checkFirestoreConnection,
  checkScanHistoryIndex,
  clearFirestoreCache,
  ScanResult
} from '../services/database';
import { firebaseInitialized as fbInitialized, reinitializeFirebase } from '../services/firebase';
import { Timestamp, DocumentData } from 'firebase/firestore';

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();

  // health check
  const [backendConnected, setBackendConnected] = useState(false);
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setBackendConnected(data.model_loaded === true);
        } else {
          setBackendConnected(false);
        }
      } catch {
        setBackendConnected(false);
      }
    };
    checkHealth();
  }, []);

  // Clear any stuck loading state when component mounts or unmounts
  useEffect(() => {
    console.log('Dashboard component mounted - clearing any stuck loading states');
    setIsLoadingHistory(false);
    setIsLoadingMoreScans(false);
    window.localStorage.removeItem('historyLoadingStartTime');

    // Also clear when component unmounts
    return () => {
      console.log('Dashboard component unmounting - clearing any stuck loading states');
      window.localStorage.removeItem('historyLoadingStartTime');
    };
  }, []);

  // tabs & states
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Database save states
  const [isSavingToDatabase, setIsSavingToDatabase] = useState(false);
  const [dbSaveError, setDbSaveError] = useState<string | null>(null);

  // Pagination states
  const [lastVisibleDoc, setLastVisibleDoc] = useState<DocumentData | undefined>(undefined);
  const [hasMoreScans, setHasMoreScans] = useState(false);
  const [isLoadingMoreScans, setIsLoadingMoreScans] = useState(false);
  const [totalScanCount, setTotalScanCount] = useState(0);
  const [pageSize] = useState(10); // Number of scans to load per page

  // Track when a new scan is added to refresh history
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(0); // Track last refresh time

  // Check if Firebase is properly initialized
  const [firebaseInitialized, setFirebaseInitialized] = useState(fbInitialized);
  const [connectionCheckAttempts, setConnectionCheckAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    // Check if Firebase is initialized by trying to get a document
    const checkFirebase = async () => {
      if (isReconnecting) {
        console.log('Skipping connection check while reconnection is in progress');
        return;
      }

      try {
        console.log('Checking Firebase connection...');
        const isConnected = await checkFirestoreConnection();
        setFirebaseInitialized(isConnected);

        if (isConnected) {
          // Clear any database connection errors if we're now connected
          if (error && error.includes('Database')) {
            setError(null);
          }
          console.log('Firebase connection check successful');
          // Reset connection attempts on success
          setConnectionCheckAttempts(0);
        } else {
          console.error('Firebase is not properly initialized or connected');
          setError('Database Connection Error: Unable to connect to the database. Scan history and saving results may not work.');
          // Increment connection attempts
          setConnectionCheckAttempts(prev => prev + 1);

          // Try to reinitialize Firebase if we've had multiple failures
          if (connectionCheckAttempts >= 2) {
            console.log('Multiple connection failures detected, attempting to reinitialize Firebase...');
            setIsReconnecting(true);

            try {
              const reinitialized = await reinitializeFirebase();
              if (reinitialized) {
                console.log('Firebase reinitialization successful');
                setFirebaseInitialized(true);
                setError('Database connection restored. You can now view your scan history.');
                setConnectionCheckAttempts(0);
              } else {
                console.error('Firebase reinitialization failed');
                setError('Database Connection Error: Unable to restore connection. Please try refreshing the page.');
              }
            } catch (reinitError) {
              console.error('Error during Firebase reinitialization:', reinitError);
            } finally {
              setIsReconnecting(false);
            }
          }
        }
      } catch (error) {
        console.error('Firebase initialization check failed:', error);
        setFirebaseInitialized(false);
        setError('Database Connection Error: Unable to connect to the database. Scan history and saving results may not work.');
        // Increment connection attempts
        setConnectionCheckAttempts(prev => prev + 1);
      }
    };

    // Run the check immediately
    checkFirebase();

    // Set up periodic checks - more frequent if we're having connection issues
    const checkInterval = setInterval(
      checkFirebase,
      connectionCheckAttempts > 3 ? 60000 : 15000 // Check every 15 seconds, or every minute if we've failed multiple times
    );

    return () => clearInterval(checkInterval);
  }, [currentUser, connectionCheckAttempts, error, isReconnecting]);

  // Function to load scan history
  const loadScanHistory = useCallback(async (reset: boolean = true) => {
    // Force any existing loading state to false if it's been more than 5 seconds
    // This helps recover from stuck states
    const now = Date.now();
    const loadingStartTime = window.localStorage.getItem('historyLoadingStartTime');

    if (loadingStartTime) {
      const timeSinceLoadingStarted = now - parseInt(loadingStartTime);
      if (timeSinceLoadingStarted > 5000) { // 5 seconds
        console.log(`Loading state has been active for ${timeSinceLoadingStarted}ms, forcing reset`);
        setIsLoadingHistory(false);
        setIsLoadingMoreScans(false);
        window.localStorage.removeItem('historyLoadingStartTime');
      }
    }

    // Prevent duplicate loads
    if (reset && isLoadingHistory) {
      console.log('Already loading history, ignoring duplicate load request');
      return;
    }

    if (!reset && isLoadingMoreScans) {
      console.log('Already loading more scans, ignoring duplicate load request');
      return;
    }

    if (!currentUser) {
      console.log('No current user, cannot load scan history');
      return;
    }

    // Check database connection first
    if (!firebaseInitialized) {
      try {
        console.log('Checking database connection before loading history...');
        const isConnected = await checkFirestoreConnection();
        setFirebaseInitialized(isConnected);

        if (!isConnected) {
          console.error('Cannot load scan history: Database not connected');
          setError('Database Connection Error: Unable to load scan history. Please try reconnecting to the database.');

          // Try to reinitialize Firebase
          console.log('Attempting to reinitialize Firebase...');
          try {
            const reinitialized = await reinitializeFirebase();
            if (reinitialized) {
              console.log('Firebase reinitialization successful, proceeding with history load');
              setFirebaseInitialized(true);
              // Continue with loading history
            } else {
              console.error('Firebase reinitialization failed');
              return; // Exit if reinitialization failed
            }
          } catch (reinitError) {
            console.error('Error during Firebase reinitialization:', reinitError);
            return; // Exit if reinitialization failed
          }
        }
      } catch (connError) {
        console.error('Error checking database connection:', connError);
        setError('Database Connection Error: Unable to verify database connection. Please try again later.');
        return;
      }
    }

    // Check if the required index exists
    try {
      console.log('Checking if required Firestore index exists...');
      const indexExists = await checkScanHistoryIndex();
      if (!indexExists) {
        console.warn('Required Firestore index does not exist. User will need to create it.');
        // We'll continue anyway and let the error handling in getUserScanResults provide the index creation URL
      } else {
        console.log('Required Firestore index exists, proceeding with query.');
      }
    } catch (indexCheckError) {
      console.error('Error checking for Firestore index:', indexCheckError);
      // Continue anyway, the actual query will provide more specific error information
    }

    // If reset is true, we're loading the first page of results
    if (reset) {
      console.log('Setting isLoadingHistory to true');
      // Store the loading start time in localStorage for recovery
      window.localStorage.setItem('historyLoadingStartTime', Date.now().toString());
      setIsLoadingHistory(true);
      setScanHistory([]);
      setLastVisibleDoc(undefined);
    } else {
      console.log('Setting isLoadingMoreScans to true');
      setIsLoadingMoreScans(true);
    }

    try {
      console.log('Loading scan history for user:', currentUser.uid);

      // Get total count for pagination info with timeout protection
      let count = 0;
      try {
        const countPromise = getUserScanCount(currentUser.uid);
        const countTimeoutPromise = new Promise<number>((_, reject) => {
          setTimeout(() => reject(new Error('Count operation timed out')), 5000);
        });

        count = await Promise.race([countPromise, countTimeoutPromise]);
        console.log(`Total scan count for user ${currentUser.uid}: ${count}`);
        setTotalScanCount(count);
      } catch (countError) {
        console.error('Error getting scan count:', countError);
        // Continue anyway, we can still try to get the results
      }

      // Get scan results with pagination and timeout protection
      console.log(`Fetching scan results for user ${currentUser.uid} with pageSize ${pageSize}`);

      // Try to clear the cache first if we're having index issues
      if (error && error.includes('requires an index')) {
        try {
          console.log('Clearing Firestore cache before query due to previous index errors...');
          await clearFirestoreCache();
        } catch (cacheError) {
          console.warn('Failed to clear cache:', cacheError);
        }
      }

      const resultsPromise = getUserScanResults(
        currentUser.uid,
        pageSize,
        reset ? undefined : lastVisibleDoc,
        // Bypass cache if we've had index issues
        Boolean(error && error.includes('requires an index'))
      );

      const resultsTimeoutPromise = new Promise<ScanResult[]>((_, reject) => {
        setTimeout(() => reject(new Error('Scan results fetch timed out')), 10000);
      });

      const results = await Promise.race([resultsPromise, resultsTimeoutPromise]);

      console.log(`Loaded ${results.length} scan results for user ${currentUser.uid}`);

      // Update state based on whether we're resetting or loading more
      if (reset) {
        setScanHistory(results);
      } else {
        setScanHistory(prev => [...prev, ...results]);
      }

      // Update pagination state
      const lastDoc = results.length > 0 ? results[results.length - 1] : undefined;
      setLastVisibleDoc(lastDoc);
      setHasMoreScans(results.length === pageSize);

      // Clear any previous errors since we successfully loaded data
      if (error && error.includes('history')) {
        setError(null);
      }

      // Log success for debugging
      console.log(`Successfully loaded ${results.length} scan results. Loading state will be set to false.`);

    } catch (e: any) {
      console.error('Error loading scan history:', e);

      // Check if this is a Firebase/Firestore error
      const errorMessage = e.message || 'Unknown error';

      if (errorMessage.includes('requires an index')) {
        console.error('Firestore index error detected:', errorMessage);
        // Keep the full error message with the index creation URL
        setError(errorMessage);
      } else if (errorMessage.includes('permission-denied') ||
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('insufficient')) {
        setError('Permission denied: You do not have access to this scan history.');
      } else if (errorMessage.includes('network') ||
                errorMessage.includes('connection') ||
                errorMessage.includes('offline')) {
        setError('Network error: Please check your internet connection and try again.');
        setFirebaseInitialized(false);
      } else if (errorMessage.includes('timed out')) {
        setError('Loading scan history timed out. Please try again.');
      } else {
        setError(`Failed to load scan history: ${errorMessage}`);
      }

      // If we have a serious database error, try to reinitialize
      if (errorMessage.includes('Database') ||
          errorMessage.includes('Firestore') ||
          errorMessage.includes('permission')) {
        console.log('Database error detected, attempting to reinitialize Firebase...');
        try {
          await reinitializeFirebase();
        } catch (reinitError) {
          console.error('Failed to reinitialize Firebase after error:', reinitError);
        }
      }
    } finally {
      // Always set loading states to false, even if there was an error
      if (reset) {
        console.log('Setting isLoadingHistory to false');
        // Clear the loading start time
        window.localStorage.removeItem('historyLoadingStartTime');
        setIsLoadingHistory(false);
      } else {
        console.log('Setting isLoadingMoreScans to false');
        setIsLoadingMoreScans(false);
      }
      console.log('Finished loading scan history, loading state set to false');
    }
  }, [currentUser, lastVisibleDoc, pageSize, firebaseInitialized, error, isLoadingHistory, isLoadingMoreScans]);

  // Debounced version of setHistoryRefreshTrigger to prevent multiple rapid updates
  const triggerHistoryRefresh = useCallback(() => {
    const now = Date.now();
    // Only allow refresh triggers if at least 2 seconds have passed since the last one
    if (now - lastRefreshTime > 2000) {
      console.log('Triggering history refresh (debounced)');
      setHistoryRefreshTrigger(prev => prev + 1);
      setLastRefreshTime(now);
    } else {
      console.log('Ignoring rapid history refresh trigger (debounced)');
    }
  }, [lastRefreshTime]);

  // We're now using direct loading instead of this function

  // State to track index creation status
  const [indexCreationAttempted, setIndexCreationAttempted] = useState(false);
  const [indexCheckInterval, setIndexCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Function to check if the index has been created
  const checkIndexAndLoadHistory = useCallback(async () => {
    if (!currentUser) return;

    console.log('Checking if Firestore index has been created...');
    try {
      const indexExists = await checkScanHistoryIndex();
      if (indexExists) {
        console.log('Index exists! Loading scan history...');
        // Clear any existing error about index
        if (error && error.includes('requires an index')) {
          setError(null);
        }
        loadScanHistory(true);

        // Clear the interval since we've successfully loaded the history
        if (indexCheckInterval) {
          clearInterval(indexCheckInterval);
          setIndexCheckInterval(null);
        }
      } else {
        console.log('Index still does not exist. Will retry later.');
      }
    } catch (err) {
      console.error('Error checking index:', err);
    }
  }, [currentUser, error, indexCheckInterval, loadScanHistory]);

  // Start periodic index check when index creation is attempted
  useEffect(() => {
    if (indexCreationAttempted && !indexCheckInterval && currentUser) {
      console.log('Starting periodic index check...');
      const interval = setInterval(() => {
        checkIndexAndLoadHistory();
      }, 30000); // Check every 30 seconds

      setIndexCheckInterval(interval);

      return () => {
        clearInterval(interval);
        setIndexCheckInterval(null);
      };
    }
  }, [indexCreationAttempted, indexCheckInterval, currentUser, checkIndexAndLoadHistory]);

  // Safety effect to ensure loading state doesn't get stuck
  useEffect(() => {
    // If loading state has been true for more than 20 seconds, force it to false
    let loadingTimer: NodeJS.Timeout | null = null;

    if (isLoadingHistory) {
      console.log('Setting safety timer for loading state');
      loadingTimer = setTimeout(() => {
        console.log('Safety timer triggered - forcing loading state to false');
        setIsLoadingHistory(false);
      }, 20000); // 20 seconds
    }

    return () => {
      if (loadingTimer) {
        clearTimeout(loadingTimer);
      }
    };
  }, [isLoadingHistory]);

  // Immediate effect to force loading state to false when scan history is available
  useEffect(() => {
    // If we have scan history data but loading state is still true, force it to false
    if (scanHistory.length > 0 && isLoadingHistory) {
      console.log('Scan history is available but still loading - forcing loading state to false');
      setIsLoadingHistory(false);
    }
  }, [scanHistory, isLoadingHistory]);

  // Load history when refresh trigger changes
  useEffect(() => {
    // Only proceed if we're on the history tab and have a user
    if (currentUser && activeTab === 'history') {
      // Skip if already loading to prevent duplicate loads
      if (isLoadingHistory) {
        console.log('Already loading history, skipping duplicate load from refresh trigger');
        return;
      }

      // Only try to load history if Firebase is initialized
      if (firebaseInitialized) {
        console.log('Loading scan history due to refresh trigger');

        // Force loading state to false first to prevent any stuck state
        setIsLoadingHistory(false);
        window.localStorage.removeItem('historyLoadingStartTime');

        // Set loading state and load history
        window.localStorage.setItem('historyLoadingStartTime', Date.now().toString());
        setIsLoadingHistory(true);

        // Use a timeout to ensure UI updates before starting the load
        setTimeout(() => {
          if (currentUser) {
            getUserScanResults(currentUser.uid, pageSize, undefined, true)
              .then(results => {
                console.log(`Loaded ${results.length} scan results from refresh trigger`);
                setScanHistory(results);

                // Update pagination state
                const lastDoc = results.length > 0 ? results[results.length - 1] : undefined;
                setLastVisibleDoc(lastDoc);
                setHasMoreScans(results.length === pageSize);
              })
              .catch(err => {
                console.error('Error loading scan history from refresh trigger:', err);
                setError(`Failed to load scan history: ${err.message}`);
              })
              .finally(() => {
                console.log('Setting loading state to false after refresh trigger load');
                setIsLoadingHistory(false);
                window.localStorage.removeItem('historyLoadingStartTime');
              });
          }
        }, 100);
      } else {
        console.log('Not loading history because Firebase is not initialized');
        setError('Database Connection Error: Please reconnect to the database to view your scan history.');
      }

      // Set a safety timeout to stop the loading state if it takes too long
      const loadingTimeout = setTimeout(() => {
        if (isLoadingHistory) {
          console.log('Loading history timeout reached, forcing loading state to false');
          setIsLoadingHistory(false);
          window.localStorage.removeItem('historyLoadingStartTime');
          setError('Loading scan history is taking longer than expected. Please try refreshing.');
        }
      }, 15000); // 15 seconds timeout

      return () => clearTimeout(loadingTimeout);
    }
  }, [currentUser, activeTab, historyRefreshTrigger, pageSize, firebaseInitialized, isLoadingHistory]);

  // Load scan count when user logs in (even if not on history tab)
  useEffect(() => {
    if (currentUser) {
      // Just load the count to show in the UI
      getUserScanCount(currentUser.uid)
        .then(count => {
          setTotalScanCount(count);
          console.log(`User has ${count} scans in history`);
        })
        .catch(err => {
          console.error('Error getting scan count:', err);
        });
    }
  }, [currentUser]);

  // handlers
  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    setAnalysisResult(null);
    setUploadedPath(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !currentUser) {
      setError('Please select a file and ensure you are logged in.');
      return;
    }

    // Start analysis - show loading state
    setIsAnalyzing(true);
    setError(null);

    // Keep the selected file during analysis but clear any previous results
    setAnalysisResult(null);
    setUploadedPath(null);

    try {
      console.log('Starting analysis...', selectedFile.name);
      const form = new FormData();
      form.append('image', selectedFile);

      // Send the request to the backend
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: form,
        // Add cache busting to prevent cached responses
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }

      // Parse the response
      const result = await res.json();
      console.log('Analysis complete:', result);

      // Update state with results
      // expected { hasTumor, confidence, tumorType, uploadedPath }
      setAnalysisResult(result);
      setUploadedPath(result.uploadedPath);

      // Save to history with better error handling and user feedback
      try {
        // Show saving indicator
        setIsSavingToDatabase(true);
        setDbSaveError(null);

        // Check database connection first
        if (!firebaseInitialized) {
          console.log('Checking database connection before saving...');
          const isConnected = await checkFirestoreConnection();

          if (!isConnected) {
            // Try to reinitialize Firebase
            console.log('Database not connected, attempting to reinitialize...');
            const reinitialized = await reinitializeFirebase();

            if (!reinitialized) {
              throw new Error('Database connection failed. Your scan results will not be saved to history.');
            }

            setFirebaseInitialized(true);
          }
        }

        // Extract the filename from the path
        const fileName = result.uploadedPath.split('/').pop() || 'unknown';

        // Create a complete scan result object
        const scanData = {
          userId: currentUser.uid,
          imageUrl: result.uploadedPath,
          result: {
            hasTumor: result.hasTumor,
            confidence: result.confidence,
            tumorType: result.tumorType,
            uploadedPath: result.uploadedPath
          },
          fileName: fileName,
          scanDate: Timestamp.now(),
          createdAt: Timestamp.now()
        };

        console.log('Preparing to save scan result to database...');

        // Save to database with timeout protection
        const savePromise = addScanResult(scanData);

        // Add a timeout to prevent hanging (increased to 30 seconds)
        const timeoutPromise = new Promise<string>((_, reject) => {
          setTimeout(() => reject(new Error('Database save operation timed out')), 30000);
        });

        // Race the save operation against the timeout
        const docId = await Promise.race([savePromise, timeoutPromise]);

        console.log('Scan result successfully saved to database with ID:', docId);
        setDbSaveError(null);

        // Trigger history refresh
        triggerHistoryRefresh();

        // Show success message
        console.log('Scan result successfully saved to history');
      } catch (saveError: any) {
        console.error('Failed to save scan result to database:', saveError);

        // Check for specific error types to provide better user feedback
        let errorMessage = 'Failed to save scan to history';

        if (saveError.message?.includes('timed out') || saveError.message?.includes('timeout')) {
          errorMessage = 'Database save operation timed out. Your scan results are still available, but may not be saved to history.';

          // Try to save again in the background without waiting
          console.log('Attempting background save without waiting for result...');
          try {
            // Create a new scan data object for the background save
            const bgScanData = {
              userId: currentUser.uid,
              imageUrl: result.uploadedPath,
              result: {
                hasTumor: result.hasTumor,
                confidence: result.confidence,
                tumorType: result.tumorType,
                uploadedPath: result.uploadedPath
              },
              fileName: result.uploadedPath.split('/').pop() || 'unknown',
              scanDate: Timestamp.now(),
              createdAt: Timestamp.now()
            };

            addScanResult(bgScanData)
              .then(docId => {
                console.log('Background save successful with ID:', docId);
                setDbSaveError(null);
                // Refresh history in case the user switches to that tab
                triggerHistoryRefresh();
              })
              .catch(bgError => {
                console.error('Background save also failed:', bgError);
              });
          } catch (bgSaveError) {
            console.error('Failed to start background save:', bgSaveError);
          }
        } else if (saveError.message?.includes('permission')) {
          errorMessage = 'Permission denied: You do not have access to save scan results.';
        } else if (saveError.message?.includes('network') || saveError.message?.includes('connection')) {
          errorMessage = 'Network error: Please check your internet connection.';
        } else if (saveError.message?.includes('not initialized') || saveError.message?.includes('database')) {
          errorMessage = 'Database connection error. Please try reconnecting to the database.';
        }

        // Set the error message
        setDbSaveError(errorMessage);

        // We'll still show the analysis results, but with a warning about the history
      } finally {
        setIsSavingToDatabase(false);
      }

      console.log('Analysis and history saving complete');
    } catch (e: any) {
      console.error('Analysis failed:', e);
      setError(e.message || 'Analysis failed');
      // Reset selected file on error so user can try again
      setSelectedFile(null);
    } finally {
      // Always set isAnalyzing to false when done
      setIsAnalyzing(false);
    }
  };

  const handleTabChange = (tab: 'upload' | 'history') => {
    // Only do something if we're actually changing tabs
    if (tab !== activeTab) {
      setActiveTab(tab);
      setError(null);

      // Reset all states when switching to upload tab
      if (tab === 'upload') {
        setSelectedFile(null);
        setAnalysisResult(null);
        setUploadedPath(null);
        setIsAnalyzing(false); // Ensure we're not stuck in analyzing state
      }

      // Load history when switching to history tab
      if (tab === 'history' && currentUser) {
        // Force loading state to false first to prevent any stuck state
        setIsLoadingHistory(false);
        window.localStorage.removeItem('historyLoadingStartTime');

        // Then start a fresh load
        console.log('Tab changed to history - starting fresh load');
        setScanHistory([]); // Clear existing history
        setLastVisibleDoc(undefined); // Reset pagination

        // Set loading state and load history
        window.localStorage.setItem('historyLoadingStartTime', Date.now().toString());
        setIsLoadingHistory(true);

        // Check if the index exists first
        checkScanHistoryIndex()
          .then(indexExists => {
            if (!indexExists) {
              console.log('Index does not exist, setting indexCreationAttempted to true');
              setIndexCreationAttempted(true);
              setError('This is the first time you are viewing scan history. Please create the required database index by clicking the button below.');
              setIsLoadingHistory(false);
              window.localStorage.removeItem('historyLoadingStartTime');
              return;
            }

            // Use a timeout to ensure UI updates before starting the load
            setTimeout(() => {
              if (currentUser) {
                getUserScanResults(currentUser.uid, pageSize, undefined, true)
                  .then(results => {
                    console.log(`Loaded ${results.length} scan results`);
                    setScanHistory(results);

                    // Update pagination state
                    const lastDoc = results.length > 0 ? results[results.length - 1] : undefined;
                    setLastVisibleDoc(lastDoc);
                    setHasMoreScans(results.length === pageSize);
                  })
                  .catch(err => {
                    console.error('Error loading scan history:', err);
                    setError(`Failed to load scan history: ${err.message}`);
                  })
                  .finally(() => {
                    console.log('Setting loading state to false after tab change load');
                    setIsLoadingHistory(false);
                    window.localStorage.removeItem('historyLoadingStartTime');
                  });
              }
            }, 100);
          })
          .catch(err => {
            console.error('Error checking index:', err);
            setError(`Failed to check database index: ${err.message}`);
            setIsLoadingHistory(false);
            window.localStorage.removeItem('historyLoadingStartTime');
          });
      }
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* health warnings */}
      {!backendConnected && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 flex items-center">
          <FaExclamationCircle className="text-yellow-500 mr-2" />
          <div>
            <p className="font-bold">Backend Connection Warning</p>
            <p>The server is unreachable or the model isn’t loaded. Analysis may not work.</p>
          </div>
        </div>
      )}

      {!firebaseInitialized && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 flex items-center">
          <FaExclamationCircle className="text-red-500 mr-2" />
          <div>
            <p className="font-bold">Database Connection Error</p>
            <p>Unable to connect to the database. Scan history and saving results may not work.</p>
            <div className="mt-2 flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="text-sm px-3 py-1 bg-red-50 hover:bg-red-100 border border-red-300 rounded"
              >
                Refresh the page
              </button>
              <button
                onClick={async () => {
                  try {
                    setError('Attempting to reconnect to database...');
                    setIsReconnecting(true);

                    // First try a simple connection check
                    const isConnected = await checkFirestoreConnection();
                    if (isConnected) {
                      setFirebaseInitialized(true);
                      setError('Database connection restored successfully.');

                      // Reload history if we're on the history tab
                      if (activeTab === 'history' && currentUser) {
                        // Force loading state to false first
                        setIsLoadingHistory(false);
                        window.localStorage.removeItem('historyLoadingStartTime');

                        // Set loading state and load history
                        window.localStorage.setItem('historyLoadingStartTime', Date.now().toString());
                        setIsLoadingHistory(true);

                        // Use a timeout to ensure UI updates before starting the load
                        setTimeout(() => {
                          getUserScanResults(currentUser.uid, pageSize, undefined, true)
                            .then(results => {
                              console.log(`Loaded ${results.length} scan results after reconnection`);
                              setScanHistory(results);

                              // Update pagination state
                              const lastDoc = results.length > 0 ? results[results.length - 1] : undefined;
                              setLastVisibleDoc(lastDoc);
                              setHasMoreScans(results.length === pageSize);
                            })
                            .catch(err => {
                              console.error('Error loading scan history after reconnection:', err);
                              setError(`Failed to load scan history: ${err.message}`);
                            })
                            .finally(() => {
                              setIsLoadingHistory(false);
                              window.localStorage.removeItem('historyLoadingStartTime');
                            });
                        }, 100);
                      }
                    } else {
                      // If simple check fails, try to reinitialize Firebase
                      console.log('Connection check failed, attempting to reinitialize Firebase...');
                      const reinitialized = await reinitializeFirebase();

                      if (reinitialized) {
                        setFirebaseInitialized(true);
                        setError('Database connection restored. You can now view your scan history.');
                        setConnectionCheckAttempts(0);

                        // Reload history if we're on the history tab
                        if (activeTab === 'history' && currentUser) {
                          // Force loading state to false first
                          setIsLoadingHistory(false);
                          window.localStorage.removeItem('historyLoadingStartTime');

                          // Set loading state and load history
                          window.localStorage.setItem('historyLoadingStartTime', Date.now().toString());
                          setIsLoadingHistory(true);

                          // Use a timeout to ensure UI updates before starting the load
                          setTimeout(() => {
                            getUserScanResults(currentUser.uid, pageSize, undefined, true)
                              .then(results => {
                                console.log(`Loaded ${results.length} scan results after Firebase reinitialization`);
                                setScanHistory(results);

                                // Update pagination state
                                const lastDoc = results.length > 0 ? results[results.length - 1] : undefined;
                                setLastVisibleDoc(lastDoc);
                                setHasMoreScans(results.length === pageSize);
                              })
                              .catch(err => {
                                console.error('Error loading scan history after Firebase reinitialization:', err);
                                setError(`Failed to load scan history: ${err.message}`);
                              })
                              .finally(() => {
                                setIsLoadingHistory(false);
                                window.localStorage.removeItem('historyLoadingStartTime');
                              });
                          }, 100);
                        }
                      } else {
                        setError('Database reconnection failed. Please try refreshing the page.');
                      }
                    }
                  } catch (e) {
                    console.error('Error during manual reconnection attempt:', e);
                    setError('Database reconnection attempt failed. Please try again later or refresh the page.');
                  } finally {
                    setIsReconnecting(false);
                  }
                }}
                disabled={isReconnecting}
                className={`text-sm px-3 py-1 ${isReconnecting
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-red-50 hover:bg-red-100 text-red-700'} border border-red-300 rounded flex items-center`}
              >
                {isReconnecting ? (
                  <>
                    <FaSpinner className="animate-spin mr-1" />
                    Reconnecting...
                  </>
                ) : (
                  'Try reconnecting'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => handleTabChange('upload')}
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'upload'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FaUpload className="inline mr-1" /> Upload & Analyze
        </button>
        <button
          onClick={() => handleTabChange('history')}
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'history'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FaHistory className="inline mr-1" /> Scan History
        </button>
      </div>

      {/* error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded flex items-center">
          <FaExclamationCircle className="mr-2" />
          {error}
        </div>
      )}

      {/* Database connection error */}
      {!firebaseInitialized && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <div className="flex items-center">
            <FaExclamationCircle className="text-yellow-500 mr-2" />
            <p className="font-bold">Database Connection Issue</p>
          </div>
          <p className="mt-1">
            Unable to connect to the database. Your scan history may not be available.
          </p>
          <div className="mt-2">
            <button
              onClick={async () => {
                setIsReconnecting(true);
                try {
                  const success = await reinitializeFirebase();
                  if (success) {
                    setFirebaseInitialized(true);
                    setError('Database connection restored.');
                  } else {
                    setError('Failed to reconnect to database. Please try again later.');
                  }
                } catch (e) {
                  console.error('Error reconnecting to database:', e);
                  setError('Error reconnecting to database. Please try again later.');
                } finally {
                  setIsReconnecting(false);
                }
              }}
              disabled={isReconnecting}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm"
            >
              {isReconnecting ? 'Reconnecting...' : 'Reconnect to Database'}
            </button>
          </div>
        </div>
      )}

      {/* upload tab */}
      {activeTab === 'upload' && (
        <div>
          {/* If we have analysis results, show them */}
          {analysisResult && uploadedPath ? (
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
                <ResultDisplay
                  result={analysisResult}
                  imageUrl={uploadedPath}
                  isSavingToDatabase={isSavingToDatabase}
                  dbSaveError={dbSaveError}
                  savedToDatabase={!isSavingToDatabase && !dbSaveError}
                  onRetrySave={() => {
                    // Check if user is logged in
                    if (!currentUser) {
                      setDbSaveError('You must be logged in to save scan results');
                      return;
                    }

                    // Create a new scan data object for retry
                    const retryScanData = {
                      userId: currentUser.uid,
                      imageUrl: uploadedPath,
                      result: {
                        hasTumor: analysisResult.hasTumor,
                        confidence: analysisResult.confidence,
                        tumorType: analysisResult.tumorType,
                        uploadedPath: uploadedPath
                      },
                      fileName: uploadedPath.split('/').pop() || 'unknown',
                      scanDate: Timestamp.now(),
                      createdAt: Timestamp.now()
                    };

                    // Show saving indicator
                    setIsSavingToDatabase(true);
                    setDbSaveError(null);

                    // Try to save again
                    console.log('Retrying save to database...');
                    addScanResult(retryScanData)
                      .then(docId => {
                        console.log('Retry save successful with ID:', docId);
                        setDbSaveError(null);
                        setIsSavingToDatabase(false);
                        // Refresh history
                        triggerHistoryRefresh();
                      })
                      .catch(retryError => {
                        console.error('Retry save failed:', retryError);
                        setDbSaveError(retryError.message || 'Failed to save scan to history');
                        setIsSavingToDatabase(false);
                      });
                  }}
                />
                <div className="mt-6">
                  <button
                    onClick={() => {
                      // Reset all states to their initial values
                      setAnalysisResult(null);
                      setUploadedPath(null);
                      setSelectedFile(null);
                      setIsAnalyzing(false);
                      setError(null);
                      setIsSavingToDatabase(false);
                      setDbSaveError(null);

                      // Log for debugging
                      console.log('Reset states for new scan analysis');
                    }}
                    className="px-4 py-2 rounded text-white font-medium bg-primary-600 hover:bg-primary-700"
                  >
                    Analyze Another Scan
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* If we're analyzing or waiting for file selection, show the uploader */
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Upload MRI Scan</h2>
              <ImageUploader
                onImageUpload={handleFileUpload}
                isLoading={isAnalyzing}
                resetOnComplete={false}
                selectedFile={selectedFile}
              />
              {selectedFile && !isAnalyzing && (
                <div className="mt-4">
                  <button
                    onClick={handleAnalyze}
                    disabled={!backendConnected || isAnalyzing}
                    className={`px-4 py-2 rounded text-white font-medium ${
                      !backendConnected
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700'
                    }`}
                  >
                    Analyze Scan
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* history tab */}
      {activeTab === 'history' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Scan History</h2>
            <div className="flex items-center">
              {totalScanCount > 0 && (
                <span className="text-sm text-gray-500 mr-3">
                  Showing {scanHistory.length} of {totalScanCount} scans
                </span>
              )}
              <button
                onClick={() => {
                  // Force loading state to false first to prevent any stuck state
                  setIsLoadingHistory(false);
                  window.localStorage.removeItem('historyLoadingStartTime');

                  // Then start a fresh load
                  console.log('Manual refresh clicked - starting fresh load');
                  setScanHistory([]); // Clear existing history
                  setLastVisibleDoc(undefined); // Reset pagination

                  // Set loading state and load history
                  window.localStorage.setItem('historyLoadingStartTime', Date.now().toString());
                  setIsLoadingHistory(true);

                  // Use a timeout to ensure UI updates before starting the load
                  setTimeout(() => {
                    if (currentUser) {
                      getUserScanResults(currentUser.uid, pageSize, undefined, true)
                        .then(results => {
                          console.log(`Loaded ${results.length} scan results`);
                          setScanHistory(results);

                          // Update pagination state
                          const lastDoc = results.length > 0 ? results[results.length - 1] : undefined;
                          setLastVisibleDoc(lastDoc);
                          setHasMoreScans(results.length === pageSize);
                        })
                        .catch(err => {
                          console.error('Error loading scan history:', err);
                          setError(`Failed to load scan history: ${err.message}`);
                        })
                        .finally(() => {
                          console.log('Setting loading state to false after manual refresh');
                          setIsLoadingHistory(false);
                          window.localStorage.removeItem('historyLoadingStartTime');
                        });
                    }
                  }, 100);
                }}
                className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                disabled={isLoadingHistory}
              >
                <FaSpinner className={`mr-1 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                {isLoadingHistory ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {isLoadingHistory && scanHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8">
              <FaSpinner className="animate-spin mb-4 text-primary-600 text-2xl" />
              <span className="text-gray-600">Loading your scan history...</span>
              <p className="text-xs text-gray-500 mt-2">This may take a moment</p>

              {/* Add a cancel button */}
              <button
                onClick={() => {
                  console.log('Cancel button clicked - forcing loading state to false');
                  window.localStorage.removeItem('historyLoadingStartTime');
                  setIsLoadingHistory(false);
                  setError('Loading cancelled. Please try again.');
                }}
                className="mt-4 text-sm text-gray-500 underline"
              >
                Cancel
              </button>
            </div>
          ) : error && error.includes('history') ? (
            error.includes('requires an index') ? (
              // Use our improved FirestoreIndexHelper component for index errors
              <FirestoreIndexHelper
                error={error}
                onRetry={async () => {
                  console.log('Retrying to load scan history after index creation...');
                  setError(null);
                  setIndexCreationAttempted(true); // Mark that we've attempted to create the index

                  // Force loading state to false first to prevent any stuck state
                  setIsLoadingHistory(false);
                  window.localStorage.removeItem('historyLoadingStartTime');

                  try {
                    // Clear the Firestore cache first to ensure we get fresh data
                    await clearFirestoreCache();
                    console.log('Cache cleared, attempting to load scan history...');

                    // Set loading state and load history
                    window.localStorage.setItem('historyLoadingStartTime', Date.now().toString());
                    setIsLoadingHistory(true);

                    // Try to load the scan history directly with cache bypass
                    if (currentUser) {
                      try {
                        const results = await getUserScanResults(currentUser.uid, pageSize, undefined, true);
                        console.log(`Successfully loaded ${results.length} scan results`);
                        setScanHistory(results);

                        // Update pagination state
                        const lastDoc = results.length > 0 ? results[results.length - 1] : undefined;
                        setLastVisibleDoc(lastDoc);
                        setHasMoreScans(results.length === pageSize);

                        // Clear any errors
                        setError(null);
                      } catch (directLoadError: any) {
                        console.error('Direct load attempt failed:', directLoadError);
                        setError(`Failed to load scan history: ${directLoadError?.message || 'Unknown error'}`);
                      }
                    }
                  } catch (cacheError: any) {
                    console.error('Error clearing cache:', cacheError);
                    setError(`Failed to clear cache: ${cacheError?.message || 'Unknown error'}`);
                  } finally {
                    // Always set loading state to false
                    setIsLoadingHistory(false);
                    window.localStorage.removeItem('historyLoadingStartTime');
                  }
                }}
              />
            ) : (
              // For other history-related errors, show a standard error message
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                <div className="flex items-center mb-2">
                  <FaExclamationCircle className="mr-2 flex-shrink-0" />
                  <p className="font-bold">Error loading scan history</p>
                </div>
                <p className="mb-2">{error}</p>
                <button
                  onClick={() => {
                    // Force loading state to false first to prevent any stuck state
                    setIsLoadingHistory(false);
                    window.localStorage.removeItem('historyLoadingStartTime');

                    // Then start a fresh load
                    console.log('Try Again clicked - starting fresh load');
                    setScanHistory([]); // Clear existing history
                    setLastVisibleDoc(undefined); // Reset pagination
                    setError(null);

                    // Set loading state and load history
                    window.localStorage.setItem('historyLoadingStartTime', Date.now().toString());
                    setIsLoadingHistory(true);

                    // Use a timeout to ensure UI updates before starting the load
                    setTimeout(() => {
                      if (currentUser) {
                        getUserScanResults(currentUser.uid, pageSize, undefined, true)
                          .then(results => {
                            console.log(`Loaded ${results.length} scan results`);
                            setScanHistory(results);

                            // Update pagination state
                            const lastDoc = results.length > 0 ? results[results.length - 1] : undefined;
                            setLastVisibleDoc(lastDoc);
                            setHasMoreScans(results.length === pageSize);
                          })
                          .catch(err => {
                            console.error('Error loading scan history:', err);
                            setError(`Failed to load scan history: ${err.message}`);
                          })
                          .finally(() => {
                            console.log('Setting loading state to false after try again');
                            setIsLoadingHistory(false);
                            window.localStorage.removeItem('historyLoadingStartTime');
                          });
                      }
                    }, 100);
                  }}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded"
                >
                  Try Again
                </button>
              </div>
            )
          ) : scanHistory.length === 0 ? (
            <div className="bg-white p-8 rounded shadow text-center">
              <p className="mb-4">No scan history yet.</p>
              <button
                onClick={() => handleTabChange('upload')}
                className="px-4 py-2 rounded text-white font-medium bg-primary-600 hover:bg-primary-700"
              >
                Upload & Analyze a Scan
              </button>
            </div>
          ) : (
            // Force loading state to false when rendering scan history
            isLoadingHistory && setIsLoadingHistory(false),
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scanHistory.map((scan) => (
                  <div key={scan.id} className="bg-white p-4 rounded shadow hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-800">
                        {scan.fileName || 'MRI Scan'}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {scan.scanDate ? scan.scanDate.toDate().toLocaleDateString() : scan.createdAt.toDate().toLocaleDateString()}
                      </span>
                    </div>
                    <img
                      src={scan.imageUrl}
                      alt="MRI Scan"
                      className="w-full h-48 object-cover mb-2 rounded"
                      onError={(e) => {
                        // Handle image loading errors
                        e.currentTarget.src = '/placeholder-image.jpg';
                        e.currentTarget.alt = 'Image unavailable';
                      }}
                    />
                    <div className="p-2 border-t mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium">
                          <strong className={scan.result.hasTumor ? 'text-red-600' : 'text-green-600'}>
                            {scan.result.hasTumor ? 'Tumor Detected' : 'No Tumor'}
                          </strong>
                        </p>
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {Math.round(scan.result.confidence * 100)}% confidence
                        </span>
                      </div>
                      {scan.result.tumorType && <p className="text-sm">Type: {scan.result.tumorType}</p>}
                      <p className="text-xs text-gray-500 mt-2">
                        Analyzed on {scan.createdAt.toDate().toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load more button */}
              {hasMoreScans && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => {
                      // Direct implementation of load more to avoid using the complex loadScanHistory function
                      console.log('Load more clicked - loading next page directly');
                      setIsLoadingMoreScans(true);

                      if (currentUser && lastVisibleDoc) {
                        getUserScanResults(currentUser.uid, pageSize, lastVisibleDoc, false)
                          .then(results => {
                            console.log(`Loaded ${results.length} more scan results`);

                            // Append to existing results
                            setScanHistory(prev => [...prev, ...results]);

                            // Update pagination state
                            const lastDoc = results.length > 0 ? results[results.length - 1] : undefined;
                            setLastVisibleDoc(lastDoc);
                            setHasMoreScans(results.length === pageSize);
                          })
                          .catch(err => {
                            console.error('Error loading more scan results:', err);
                            setError(`Failed to load more scans: ${err.message}`);
                          })
                          .finally(() => {
                            console.log('Setting loading more state to false');
                            setIsLoadingMoreScans(false);
                          });
                      } else {
                        console.error('Cannot load more: missing user or last document reference');
                        setIsLoadingMoreScans(false);
                      }
                    }}
                    disabled={isLoadingMoreScans}
                    className="px-4 py-2 rounded text-primary-600 border border-primary-600 hover:bg-primary-50 flex items-center"
                  >
                    {isLoadingMoreScans ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <FaChevronDown className="mr-2" />
                        Load More
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Loading more indicator */}
              {isLoadingMoreScans && (
                <div className="text-center mt-4 text-gray-500">
                  <FaSpinner className="animate-spin inline mr-2" />
                  Loading more scans...
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
