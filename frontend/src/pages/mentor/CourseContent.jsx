import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { coursesAPI, questsAPI } from '../../utils/api';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Icons
import {
  AcademicCapIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowsUpDownIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  LinkIcon,
  FolderIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

function CourseContent() {
  const { courseId } = useParams();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [isAddingSubMaterial, setIsAddingSubMaterial] = useState(null); // materialId for sub-material to add
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    order: 0
  });
  const [newSubMaterial, setNewSubMaterial] = useState({
    title: '',
    type: 'video',
    content: '',
    url: '',
    duration: '',
    order: 0
  });

  const queryClient = useQueryClient();

  // Fetch all courses for the mentor
  const { data: mentorCourses, isLoading: coursesLoading, isError: coursesError } = useQuery(
    'mentorCourses',
    () => coursesAPI.getMyCourses().then(res => res.data.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  // Fetch specific course if courseId is provided
  const { data: courseData, isLoading: courseLoading, isError: courseError } = useQuery(
    ['course', courseId],
    () => coursesAPI.getOne(courseId).then(res => res.data.data),
    {
      enabled: !!courseId,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (mentorCourses) {
      setCourses(mentorCourses);
      if (courseId && mentorCourses.length > 0) {
        const course = mentorCourses.find(c => c._id === courseId);
        setSelectedCourse(course);
        if (course && course.materials) {
          // Sort materials by order
          const sortedMaterials = [...course.materials].sort((a, b) => (a.order || 0) - (b.order || 0));
          setMaterials(sortedMaterials);
        }
      }
    }
  }, [mentorCourses, courseId]);

  useEffect(() => {
    if (courseData) {
      setSelectedCourse(courseData);
      if (courseData.materials) {
        // Sort materials by order
        const sortedMaterials = [...courseData.materials].sort((a, b) => (a.order || 0) - (b.order || 0));
        setMaterials(sortedMaterials);
      }
    }
  }, [courseData]);

  // Mutations for materials management
  const addMaterialMutation = useMutation(
    (materialData) => coursesAPI.addMaterial(courseId, materialData),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(['course', courseId]);
        queryClient.invalidateQueries('mentorCourses');
        toast.success('Material added successfully');
        setIsAddingMaterial(false);
        setNewMaterial({
          title: '',
          description: '',
          order: 0
        });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add material');
      }
    }
  );

  const updateMaterialMutation = useMutation(
    ({ materialId, materialData }) => coursesAPI.updateMaterial(courseId, materialId, materialData),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(['course', courseId]);
        queryClient.invalidateQueries('mentorCourses');
        toast.success('Material updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update material');
      }
    }
  );

  const deleteMaterialMutation = useMutation(
    (materialId) => coursesAPI.deleteMaterial(courseId, materialId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['course', courseId]);
        queryClient.invalidateQueries('mentorCourses');
        toast.success('Material deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete material');
      }
    }
  );

  const addSubMaterialMutation = useMutation(
    ({ materialId, subMaterialData }) => coursesAPI.addSubMaterial(courseId, materialId, subMaterialData),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(['course', courseId]);
        queryClient.invalidateQueries('mentorCourses');
        toast.success('Sub-material added successfully');
        setIsAddingSubMaterial(null);
        setNewSubMaterial({
          title: '',
          type: 'video',
          content: '',
          url: '',
          duration: '',
          order: 0
        });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add sub-material');
      }
    }
  );

  const updateSubMaterialMutation = useMutation(
    ({ materialId, subMaterialId, subMaterialData }) => 
      coursesAPI.updateSubMaterial(courseId, materialId, subMaterialId, subMaterialData),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(['course', courseId]);
        queryClient.invalidateQueries('mentorCourses');
        toast.success('Sub-material updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update sub-material');
      }
    }
  );

  const deleteSubMaterialMutation = useMutation(
    ({ materialId, subMaterialId }) => coursesAPI.deleteSubMaterial(courseId, materialId, subMaterialId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['course', courseId]);
        queryClient.invalidateQueries('mentorCourses');
        toast.success('Sub-material deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete sub-material');
      }
    }
  );

  const handleAddMaterial = (e) => {
    e.preventDefault();

    if (!newMaterial.title) {
      toast.error('Please provide a title for the material');
      return;
    }

    const materialData = {
      title: newMaterial.title,
      description: newMaterial.description,
      order: parseInt(newMaterial.order) || materials.length
    };

    addMaterialMutation.mutate(materialData);
  };

  const handleAddSubMaterial = (materialId, e) => {
    e.preventDefault();

    if (!newSubMaterial.title) {
      toast.error('Please provide a title for the sub-material');
      return;
    }

    const subMaterialData = {
      title: newSubMaterial.title,
      type: newSubMaterial.type,
      content: newSubMaterial.content,
      url: newSubMaterial.url,
      duration: parseInt(newSubMaterial.duration) || 0,
      order: parseInt(newSubMaterial.order) || 0
    };

    addSubMaterialMutation.mutate({ materialId, subMaterialData });
  };

  const handleUpdateMaterialOrder = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === materials.length - 1)) {
      return;
    }

    const updatedMaterials = [...materials];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    // Swap order values
    const temp = updatedMaterials[index].order;
    updatedMaterials[index].order = updatedMaterials[targetIndex].order;
    updatedMaterials[targetIndex].order = temp;

    // Update material orders
    updateMaterialMutation.mutate({
      materialId: updatedMaterials[index]._id,
      materialData: { order: updatedMaterials[index].order }
    });
    
    updateMaterialMutation.mutate({
      materialId: updatedMaterials[targetIndex]._id,
      materialData: { order: updatedMaterials[targetIndex].order }
    });
  };

  const handleUpdateSubMaterialOrder = (materialIndex, subIndex, direction) => {
    const material = materials[materialIndex];
    const subMaterials = [...material.subMaterials];
    
    if ((direction === 'up' && subIndex === 0) || (direction === 'down' && subIndex === subMaterials.length - 1)) {
      return;
    }

    const targetIndex = direction === 'up' ? subIndex - 1 : subIndex + 1;

    // Swap order values
    const temp = subMaterials[subIndex].order;
    subMaterials[subIndex].order = subMaterials[targetIndex].order;
    subMaterials[targetIndex].order = temp;

    // Update sub-material orders
    updateSubMaterialMutation.mutate({
      materialId: material._id,
      subMaterialId: subMaterials[subIndex]._id,
      subMaterialData: { order: subMaterials[subIndex].order }
    });
    
    updateSubMaterialMutation.mutate({
      materialId: material._id,
      subMaterialId: subMaterials[targetIndex]._id,
      subMaterialData: { order: subMaterials[targetIndex].order }
    });
  };

  const contentTypes = [
    { value: 'video', label: 'Video', icon: VideoCameraIcon },
    { value: 'article', label: 'Article', icon: DocumentTextIcon },
    { value: 'resource', label: 'Resource', icon: LinkIcon }
  ];

  if (coursesLoading || (courseId && courseLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (coursesError || courseError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-semibold">Error loading courses</h2>
          <p>Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {courseId ? selectedCourse?.title || 'Course Materials' : 'Manage Course Materials'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {courseId
                ? 'Manage materials (Bab) and sub-materials (Sub-bab) for your course'
                : 'Select a course to manage its materials'}
            </p>
          </div>

          {courseId && (
            <Link
              to={`/mentor`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Dashboard
            </Link>
          )}
        </div>
      </div>

      {!courseId ? (
        // Course selection view
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {courses.map((course) => (
              <li key={course._id}>
                <Link to={`/mentor/content/${course._id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-blue-600 truncate">
                        {course.title}
                      </div>
                      <div className="ml-2 flex flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {course.materials?.length || 0} materials
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <div className="text-sm text-gray-500 truncate">
                        {course.description}
                      </div>
                      <div className="text-sm text-gray-500">
                        {course.category} • {course.difficulty}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        // Materials management view
        <div className="space-y-6">
          {/* Course Info Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">{selectedCourse?.title}</h2>
                <p className="mt-1 text-sm text-gray-500">{selectedCourse?.description}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span>{materials.length} materials</span>
                  <span className="mx-2">•</span>
                  <span>{selectedCourse?.category}</span>
                  <span className="mx-2">•</span>
                  <span>{selectedCourse?.difficulty}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/mentor/create-quest?course=${courseId}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <QuestionMarkCircleIcon className="h-4 w-4 mr-2" />
                  Create Quest
                </Link>
                <Link
                  to={`/courses/${courseId}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Course
                </Link>
              </div>
            </div>
          </div>

          {/* Materials List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Course Materials (Bab)</h3>
                <button
                  onClick={() => setIsAddingMaterial(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Material
                </button>
              </div>
            </div>

            {materials.length === 0 ? (
              <div className="text-center py-12">
                <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No materials yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding your first material.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setIsAddingMaterial(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Add Material
                  </button>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {materials.map((material, materialIndex) => (
                  <li key={material._id}>
                    {/* Material Header */}
                    <div className="px-4 py-4 sm:px-6 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FolderIcon className="h-5 w-5 text-blue-500 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{material.title}</div>
                            <div className="text-sm text-gray-500">
                              {material.description || 'No description'}
                              <span className="mx-2">•</span>
                              <span>Order: {material.order + 1}</span>
                              <span className="mx-2">•</span>
                              <span>{material.subMaterials?.length || 0} sub-items</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateMaterialOrder(materialIndex, 'up')}
                            disabled={materialIndex === 0}
                            className={`p-1 rounded ${materialIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                            <ArrowsUpDownIcon className="h-4 w-4 transform rotate-180" />
                          </button>
                          <button
                            onClick={() => handleUpdateMaterialOrder(materialIndex, 'down')}
                            disabled={materialIndex === materials.length - 1}
                            className={`p-1 rounded ${materialIndex === materials.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                            <ArrowsUpDownIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteMaterialMutation.mutate(material._id)}
                            className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Sub-materials List */}
                    <div className="px-4 py-2 sm:px-6">
                      {material.subMaterials && material.subMaterials.length > 0 ? (
                        <ul className="space-y-2">
                          {material.subMaterials.map((subMaterial, subIndex) => {
                            const ContentTypeIcon = contentTypes.find(ct => ct.value === subMaterial.type)?.icon || DocumentTextIcon;
                            return (
                              <li key={subMaterial._id} className="flex items-center justify-between bg-white border border-gray-200 rounded-md p-3">
                                <div className="flex items-center">
                                  <ContentTypeIcon className="h-4 w-4 text-gray-400 mr-2" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{subMaterial.title}</div>
                                    <div className="text-xs text-gray-500">
                                      {contentTypes.find(ct => ct.value === subMaterial.type)?.label}
                                      {subMaterial.duration && ` • ${subMaterial.duration} min`}
                                      {subMaterial.order !== undefined && ` • Order: ${subMaterial.order + 1}`}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleUpdateSubMaterialOrder(materialIndex, subIndex, 'up')}
                                    disabled={subIndex === 0}
                                    className={`p-1 rounded ${subIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'}`}
                                  >
                                    <ArrowsUpDownIcon className="h-3 w-3 transform rotate-180" />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateSubMaterialOrder(materialIndex, subIndex, 'down')}
                                    disabled={subIndex === material.subMaterials.length - 1}
                                    className={`p-1 rounded ${subIndex === material.subMaterials.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'}`}
                                  >
                                    <ArrowsUpDownIcon className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => deleteSubMaterialMutation.mutate({ materialId: material._id, subMaterialId: subMaterial._id })}
                                    className="p-1 rounded text-red-500 hover:text-red-700"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No sub-materials added yet
                        </div>
                      )}

                      {/* Add Sub-Material Button */}
                      <div className="mt-3">
                        <button
                          onClick={() => setIsAddingSubMaterial(material._id)}
                          className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          <PlusIcon className="h-3 w-3 mr-1" />
                          Add Sub-Material
                        </button>
                      </div>

                      {/* Add Sub-Material Form */}
                      {isAddingSubMaterial === material._id && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-md">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Sub-Material (Sub-bab)</h4>

                          <form onSubmit={(e) => handleAddSubMaterial(material._id, e)} className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label htmlFor={`sub-title-${material._id}`} className="block text-xs font-medium text-gray-700 mb-1">
                                  Title *
                                </label>
                                <input
                                  type="text"
                                  id={`sub-title-${material._id}`}
                                  value={newSubMaterial.title}
                                  onChange={(e) => setNewSubMaterial({...newSubMaterial, title: e.target.value})}
                                  required
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Sub-material title"
                                />
                              </div>

                              <div>
                                <label htmlFor={`sub-type-${material._id}`} className="block text-xs font-medium text-gray-700 mb-1">
                                  Type
                                </label>
                                <select
                                  id={`sub-type-${material._id}`}
                                  value={newSubMaterial.type}
                                  onChange={(e) => setNewSubMaterial({...newSubMaterial, type: e.target.value})}
                                  className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                  {contentTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                      {type.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label htmlFor={`sub-duration-${material._id}`} className="block text-xs font-medium text-gray-700 mb-1">
                                  Duration (minutes)
                                </label>
                                <input
                                  type="number"
                                  id={`sub-duration-${material._id}`}
                                  value={newSubMaterial.duration}
                                  onChange={(e) => setNewSubMaterial({...newSubMaterial, duration: e.target.value})}
                                  min="0"
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Duration in minutes"
                                />
                              </div>

                              <div>
                                <label htmlFor={`sub-order-${material._id}`} className="block text-xs font-medium text-gray-700 mb-1">
                                  Order
                                </label>
                                <input
                                  type="number"
                                  id={`sub-order-${material._id}`}
                                  value={newSubMaterial.order}
                                  onChange={(e) => setNewSubMaterial({...newSubMaterial, order: parseInt(e.target.value) || 0})}
                                  min="0"
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Position in material"
                                />
                              </div>
                            </div>

                            <div>
                              <label htmlFor={`sub-url-${material._id}`} className="block text-xs font-medium text-gray-700 mb-1">
                                URL (optional)
                              </label>
                              <input
                                type="url"
                                id={`sub-url-${material._id}`}
                                value={newSubMaterial.url}
                                onChange={(e) => setNewSubMaterial({...newSubMaterial, url: e.target.value})}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="https://example.com"
                              />
                            </div>

                            <div>
                              <label htmlFor={`sub-content-${material._id}`} className="block text-xs font-medium text-gray-700 mb-1">
                                Content (optional)
                              </label>
                              <textarea
                                id={`sub-content-${material._id}`}
                                rows={2}
                                value={newSubMaterial.content}
                                onChange={(e) => setNewSubMaterial({...newSubMaterial, content: e.target.value})}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Content details for this sub-material"
                              />
                            </div>

                            <div className="flex justify-end space-x-2 pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddingSubMaterial(null);
                                  setNewSubMaterial({
                                    title: '',
                                    type: 'video',
                                    content: '',
                                    url: '',
                                    duration: '',
                                    order: 0
                                  });
                                }}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={addSubMaterialMutation.isLoading}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                              >
                                {addSubMaterialMutation.isLoading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                    Adding...
                                  </>
                                ) : (
                                  'Add Sub-Material'
                                )}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add Material Form */}
          {isAddingMaterial && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Material (Bab)</h3>

              <form onSubmit={handleAddMaterial} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="material-title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="material-title"
                      value={newMaterial.title}
                      onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Material title"
                    />
                  </div>

                  <div>
                    <label htmlFor="material-order" className="block text-sm font-medium text-gray-700 mb-1">
                      Order
                    </label>
                    <input
                      type="number"
                      id="material-order"
                      value={newMaterial.order}
                      onChange={(e) => setNewMaterial({...newMaterial, order: parseInt(e.target.value) || 0})}
                      min="0"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Position in course"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="material-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    id="material-description"
                    rows={3}
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Description for this material"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingMaterial(false);
                      setNewMaterial({
                        title: '',
                        description: '',
                        order: 0
                      });
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addMaterialMutation.isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {addMaterialMutation.isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      'Add Material'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CourseContent;